
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

---
