
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

### Connection type

- **CONNECTION_TYPE**: Specifies the connection protocol (FTP or SFTP) for the server, determining the required environment variables for connection. Only one connection type can be used at a time.

### FTP Configuration

- **FTP_HOST**: The hostname or IP address of the FTP server.
- **FTP_USER**: The username for the FTP connection.
- **FTP_PASSWORD**: The password for the FTP connection.
- **FTP_PORT**: The port used for the FTP connection (default is typically 21).

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

### Diff Checker
 Usually one of `compareSize`, `compareContent`, `compareFileHash` or `COMPARE_DATE` options has to be activated.
 
- **COMPARE_SIZE**: Compares files by size.
  **Default:** `false`
- **COMPARE_FILE_HASH**: Compares files by file hash.
  **Default:** `false`
- **HASH_ALGORITHM**: The hashing algorithms are used to generate a fixed-size hash value from the file.
  **Default:** `sha1`
- **COMPARE_CONTENT**: Compares files by content.
  **Default:** `true`
- **COMPARE_DATE**: Compares files by date of modification (stat.mtime).
  **Default:** `false`
- **DATE_TOLERANCE**: Two files are considered to have the same date if the difference between their modification dates fits within date tolerance.
  **Default:** `1000`
- **DIFF_CHECKER_INCLUDE_FILTER**: File name filter. Comma separated minimatch patterns (e.g., `"*.js"`).
- **DIFF_CHECKER_EXCLUDE_FILTER**: File/directory name exclude filter. Comma separated minimatch patterns (e.g., `"*.log,*css,*tsx"`).

To add the new enum for `HashAlgorithms` to your README, you can include a section describing it along with the default value and possible options. Here's how you can present it:

---

### Available Hashing Algorithms

You can choose from the following hashing algorithms:

```typescript
export enum HashAlgorithms {
  md5 = 'md5',
  sha1 = 'sha1',
  sha256 = 'sha256',
  sha512 = 'sha512'
}
```

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

- **`SMTP_FROM`**: The email address that appears as the sender.

- **`SMTP_FROM`**: The recipient's email address.


### Example `.env` File
```env
CONNECTION_TYPE=FTP
FTP_HOST=ftp.example.com

FTP_USER=myUsername
FTP_PASSWORD=myPassword123
FTP_PORT=21
FTP_DEBUG=true

REMOTE_ENTRY_POINT=/var/www/example

GITHUB_URL=https://github.com/your-repo/your-project
GITHUB_TAG_NAME=v1.0.0

FTP_INCLUDE_FILTER=*.php,*.html,*.css
FTP_EXCLUDE_FILTER=*.log,*.tmp

SFTP_INCLUDE_FILTER=*.php,*.html,*.css
SFTP_EXCLUDE_FILTER=*.log,*.tmp

COMPARE_SIZE=false
COMPARE_FILE_HASH=sha1
HASH_ALGORITHM=false
COMPARE_CONTENT=true
COMPARE_DATE=false
DATE_TOLERANCE=2000
DIFF_CHECKER_INCLUDE_FILTER=*.php,*.js
DIFF_CHECKER_EXCLUDE_FILTER=*.log,*.cache

JOB_TIME=02:00

SMTP_SERVICE=gmail
SMTP_HOST=smtp.mailprovider.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=strongpassword

SMTP_FROM=noreply@example.com
SMTP_FROM_NAME=Example App

SMTP_TO=admin@example.com
SMTP_TO_NAME=Administrator
```

---
