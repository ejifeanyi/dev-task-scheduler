# Task Scheduler CLI

A simple command-line task scheduler with email notifications.

## Installation

Fork the project

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/dev-task-scheduler
   ```
2. Navigate to the project directory:
   ```bash
   cd task-scheduler
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install the CLI globally:
   ```bash
   npm install -g .
   ```

## Features

- Schedule tasks with descriptions and execution times.
- Receive email notifications for scheduled tasks.
- View all tasks and their statuses.
- Uses local storage—no database setup required.
- Simple and user-friendly command-line interface.

## Usage

1. **Configure email notifications**

   ```bash
   task setup-email
   ```

2. **Add a new task**

   ```bash
   task add
   ```

3. **List all tasks**

   ```bash
   task list
   ```

4. **Start the task monitor**
   ```bash
   task start
   ```

## Configuration

No environment variables are required. All configurations are handled through the CLI.

## Dependencies

This project uses the following libraries:

- **commander** – Command-line interface management.
- **node-cron** – Task scheduling.
- **nodemailer** – Email notifications.
- **chalk** – Terminal styling for better readability.
- **inquirer** – Interactive prompts for user input.
- **date-fns** – Date formatting utilities.
- **conf** – Local configuration storage.
