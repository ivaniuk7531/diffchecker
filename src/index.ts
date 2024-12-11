import { DiffCheckerService } from './services/DiffCheckerService/service.js';
import { SFTPService } from './services/SFTPService/service.js';
import { GitHubService } from './services/GitHubService/index.js';
import { CronService } from './services/CroneService/index.js';
import { DOWNLOADS_DIR, OUTPUT_DIR } from './constants/defaultPaths.js';
import {
  GITHUB_TAG_NAME,
  GITHUB_URL,
  JOB_TIME,
  REMOTE_ENTRY_POINT,
  SFTP_HOST,
  SFTP_PASSWORD,
  SFTP_PORT,
  SFTP_USER
} from './constants/env.js';
import { SFTP_SERVICE_DEFAULT_OPTIONS } from './services/SFTPService/index.js';
import { DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS } from './services/DiffCheckerService/constants.js';
import { EmailService } from './services/EmailService/index.js';

const cronService = new CronService();

async function init() {
  const sftpService = new SFTPService(
    SFTP_HOST,
    SFTP_USER,
    SFTP_PASSWORD,
    SFTP_PORT,
    SFTP_SERVICE_DEFAULT_OPTIONS
  );
  const emailService = EmailService.getInstance();

  try {
    const startTime = performance.now();

    const gitHubService = new GitHubService(GITHUB_URL, GITHUB_TAG_NAME);
    const gitHubRepoName = gitHubService.getRepoName();
    const clonePath = gitHubService.getClonePath();

    const downloadsDestinationPath = `${OUTPUT_DIR}/${DOWNLOADS_DIR}/${gitHubRepoName}/${GITHUB_TAG_NAME}`;

    await sftpService.connect();

    await Promise.all([
      gitHubService.cloneRepoByTag(clonePath),
      sftpService.downloadFiles(downloadsDestinationPath, REMOTE_ENTRY_POINT)
    ]);

    const compareResult = await DiffCheckerService.compare(
      downloadsDestinationPath,
      clonePath,
      DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS
    );

    const uploadedFiles = await sftpService.uploadFiles(compareResult);

    if (uploadedFiles && uploadedFiles?.length !== 0) {
      await emailService.sendUploadReport(uploadedFiles, gitHubRepoName);
    }

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} milliseconds`);
  } catch (err) {
    if (err instanceof Error) {
      console.error('An error occurred during initialization:', err.message);

      await emailService.sendEmail('Script initialization error', err.message);
    }
  } finally {
    await sftpService.closeConnection();
  }
}

async function validateEnvVariables() {
  try {
    const requiredEnvVars = [
      'SFTP_HOST',
      'SFTP_USER',
      'SFTP_PASSWORD',
      'SFTP_PORT',
      'GITHUB_URL',
      'GITHUB_TAG_NAME',
      'REMOTE_ENTRY_POINT'
    ];

    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables - ${missingEnvVars.join(', ')}`
      );
    }

    await init();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }
}

cronService.createJob(JOB_TIME, validateEnvVariables, true, true);
