
Diffchecker
---


The project aims to develop a script for automatically monitoring and comparing files between the current CMS installation (particularly OJS – Open Journal Systems) on the server and the original files from the official repository. This will help identify and restore files that have been altered or corrupted by malicious actors.

### Available Scripts

The following npm scripts are available in this project:

- **start**: Builds the project and then starts the application.
  ```bash
  yarn start
  ```

- **dev**: Runs the application in development mode using `nodemon` for live reloading.
  ```bash
  yarn dev
  ```

- **build**: Cleans the previous build and compiles the project using TypeScript.
  ```bash
  yarn build
  ```

- **lint**: Runs ESLint on all `.ts` and `.tsx` files and attempts to fix issues.
  ```bash
  yarn lint
  ```

- **prepare**: Initializes Husky for git hooks.
  ```bash
  yarn prepare
  ```

Make sure to install all dependencies before running these scripts:

```bash
yarn install
```

---

This section should provide clear instructions for setting up the environment and using the project scripts.

# Environment Configuration

This project requires several environment variables to be set for proper functionality. Below are the required variables and their descriptions:

### SFTP Configuration

- **SFTP_HOST**: The hostname or IP address of the SFTP server.
- **SFTP_USER**: The username for the SFTP connection.
- **SFTP_PASSWORD**: The password for the SFTP connection.
- **SFTP_PORT**: The port used for the SFTP connection (default is typically 22).

### Remote Entry Point

- **REMOTE_ENTRY_POINT**: The entry point URL or path for remote operations.

### GitHub Configuration

- **GITHUB_URL**: The URL of the GitHub repository (e.g., `https://github.com/user/repo`).
- **GITHUB_TAG_NAME**: The specific tag or version name in the GitHub repository.

### SFTP Filters

- **SFTP_INCLUDE_FILTER**: File name filter. Comma separated minimatch patterns (e.g., `"*.txt"`).
- **SFTP_EXCLUDE_FILTER**: File/directory name exclude filter. Comma separated minimatch patterns (e.g., `"*.log,*css,*tsx"`).

### Diff Checker Filters

- **DIFF_CHECKER_INCLUDE_FILTER**: File name filter. Comma separated minimatch patterns (e.g., `"*.js"`).
- **DIFF_CHECKER_EXCLUDE_FILTER**: File/directory name exclude filter. Comma separated minimatch patterns (e.g., `"*.log,*css,*tsx"`).

### Crone

- **JOB_TIME**: Environment variable defines the schedule for the cron job in the cron format:

```
* * * * * *
| | | | | |
| | | | | +-- Day of the week (0 - 6) (Sunday = 0)
| | | | +---- Month (1 - 12)
| | | +------ Day of the month (1 - 31)
| | +-------- Hour (0 - 23)
| +---------- Minute (0 - 59)
+------------ Second (0 - 59)
```


### Example Values:
- `"*/5 * * * * *"`: Executes the job every 5 seconds.
- `"0 * * * * *"`: Executes the job at the start of every minute.
- `"0 0 * * * *"`: Executes the job at midnight every day.
- `"0 12 * * 1"`: Executes the job at 12:00 PM every Monday.

### Default Value:
- `"*/30 * * * *"`: Executes the job every 30 seconds.

### SMTP Configuration

The following environment variables are used to configure the SMTP service for sending emails. Ensure these variables are set correctly in your environment file or server configuration to enable email functionality.

- **`SMTP_SERVICE` (string)**: Specifies the identifier or name representing the SMTP service provider. By default, this is set to `gmail`.  
  **Default:** `gmail`

- **`SMTP_HOST` (string)**: Defines the host address of the SMTP server. The default is `smtp.gmail.com`.  
  **Default:** `smtp.gmail.com`

- **`SMTP_PORT` (number)**: Indicates the port number used to establish a connection with the SMTP server. The default is `587`, commonly used for TLS connections.  
  **Default:** `587`

- **`SMTP_USER`**: The username or email address used to authenticate with the SMTP server. This is often the email address of the sender.

- **`SMTP_PASS`**: The password or application-specific token used to authenticate the user with the SMTP server.

- **`SMTP_FROM`**: The email address of the sender.

- **`SMTP_FROM_NAME`**: The display name of the sender (optional)


### Example `.env` File
```env
SMTP_SERVICE=1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-secure-password
SMTP_FROM=email address of the sender
SMTP_FROM_NAME=name of the sender
SMTP_TO=recipient email address (to)
SMTP_TO_NAME=recipient's display name (optional)
```

### Security Note

- **Do not hard-code sensitive information in your source code.** Always use environment variables to keep credentials secure.
- If your SMTP provider supports app-specific passwords or tokens, prefer using them over your main account password.

---
