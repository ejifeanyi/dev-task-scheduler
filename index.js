#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import cron from "node-cron";
import nodemailer from "nodemailer";
import chalk from "chalk";
import Conf from "conf";
import { format } from "date-fns";

const program = new Command();

// Config store
const config = new Conf({
	projectName: "dev-task-scheduler",
	defaults: {
		tasks: [],
		email: null,
	},
});

// Email configuration setup
async function setupEmail(email) {
	const answers = await inquirer.prompt([
		{
			type: "password",
			name: "password",
			message: "Enter your app password:",
			mask: "*",
		},
	]);

	config.set("email", {
		email: email,
		password: answers.password,
	});

	// Test email configuration
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: email,
				pass: answers.password,
			},
		});

		await transporter.verify();
		console.log(
			chalk.green("Email configuration tested and saved successfully!")
		);
	} catch (error) {
		console.error(
			chalk.red("Error verifying email configuration:"),
			error.message
		);
		config.delete("email");
	}
}

// Add task command
program
	.command("add")
	.description("Add a new task")
	.action(async () => {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "description",
				message: "Enter task description:",
			},
			{
				type: "input",
				name: "date",
				message: "Enter date (YYYY-MM-DD):",
				validate: (input) => !isNaN(Date.parse(input)),
			},
			{
				type: "input",
				name: "time",
				message: "Enter time (HH:mm):",
				validate: (input) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input),
			},
		]);

		const tasks = config.get("tasks");
		const scheduledTime = new Date(`${answers.date} ${answers.time}`);

		tasks.push({
			id: Date.now(),
			description: answers.description,
			scheduledTime: scheduledTime.toISOString(),
			status: "pending",
		});

		config.set("tasks", tasks);
		console.log(chalk.green("Task added successfully!"));
	});

// List tasks command
program
	.command("list")
	.description("List all tasks")
	.action(() => {
		const tasks = config.get("tasks");
		if (tasks.length === 0) {
			console.log(chalk.yellow("No tasks scheduled"));
			return;
		}

		tasks.forEach((task) => {
			const date = format(new Date(task.scheduledTime), "PPpp");
			console.log(
				chalk.blue(`\nTask: ${task.description}`),
				`\nScheduled: ${date}`,
				`\nStatus: ${task.status}`
			);
		});
	});

// Setup email command
program
	.command("setup-email <email>")
	.description("Setup email notifications")
	.action(setupEmail);

// Start monitoring command
program
	.command("start")
	.description("Start task monitoring")
	.action(async () => {
		const emailConfig = config.get("email");
		if (!emailConfig) {
			console.log(
				chalk.red("Email not configured. Please run setup-email first.")
			);
			return;
		}

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: emailConfig.email,
				pass: emailConfig.password,
			},
		});

		console.log(chalk.green("Task monitoring started..."));

		cron.schedule("* * * * *", () => {
			const tasks = config.get("tasks");
			const now = new Date();

			tasks.forEach(async (task, index) => {
				if (task.status === "pending" && new Date(task.scheduledTime) <= now) {
					try {
						await transporter.sendMail({
							from: emailConfig.email,
							to: emailConfig.email,
							subject: "Task Reminder",
							text: `Reminder: ${task.description}`,
						});

						tasks[index].status = "completed";
						config.set("tasks", tasks);

						console.log(
							chalk.green(`Notification sent for task: ${task.description}`)
						);
					} catch (error) {
						console.error(chalk.red("Error sending email:", error.message));
					}
				}
			});
		});
	});

program.parse(process.argv);
