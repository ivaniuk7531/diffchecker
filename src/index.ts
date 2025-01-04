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
  const emailService = new EmailService();

  try {
    const startTime = performance.now();

    const gitHubService = new GitHubService(GITHUB_URL, GITHUB_TAG_NAME);

    await gitHubService.setGitConfig();

    const gitHubRepoName = gitHubService.getRepoName();
    const clonePath = gitHubService.getClonePath();

    const downloadsDestinationPath = `${OUTPUT_DIR}/${DOWNLOADS_DIR}/${gitHubRepoName}/${GITHUB_TAG_NAME}`;

    await sftpService.connect();

    const results = await Promise.allSettled([
      gitHubService.cloneRepoByTag(clonePath),
      sftpService.downloadFiles(downloadsDestinationPath, REMOTE_ENTRY_POINT)
    ]);

    const allResolved = results.every(
      (result) => result.status === 'fulfilled'
    );

    if (!allResolved) {
      throw new Error('Error During Repository Cloning or File Download');
    }

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
      console.error('Script execution error:', err.message);

      await emailService.sendEmail('Script execution error', err.message);
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
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }
}

cronService.createJob(JOB_TIME, validateEnvVariables, true, true);
