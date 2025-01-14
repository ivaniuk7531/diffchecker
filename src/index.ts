import { GitHubService } from './services/GitHubService/index.js';
import { CronService } from './services/CroneService/index.js';
import { DOWNLOADS_DIR, OUTPUT_DIR } from './constants/defaultPaths.js';
import {
  CONNECTION_TYPE,
  GITHUB_TAG_NAME,
  GITHUB_URL,
  JOB_TIME,
  REMOTE_ENTRY_POINT,
  SERVER_NAME_UNIQUE_IDENTIFIER
} from './constants/env.js';
import { EmailService } from './services/EmailService/index.js';
import { DiffCheckerService } from './services/DiffCheckerService/index.js';
import { DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS } from './services/DiffCheckerService/constants.js';
import {
  ConnectionService,
  ConnectionType
} from './services/ConnectionService/index.js';

const cronService = new CronService();

async function init() {
  const client = ConnectionService.getClient(CONNECTION_TYPE);
  const emailService = new EmailService();

  try {
    const startTime = performance.now();

    const gitHubService = new GitHubService(GITHUB_URL, GITHUB_TAG_NAME);

    await gitHubService.setGitConfig();

    const gitHubRepoName = gitHubService.getRepoName();
    const clonePath = gitHubService.getClonePath();

    const downloadsDestinationPath = `${OUTPUT_DIR}/${DOWNLOADS_DIR}/${SERVER_NAME_UNIQUE_IDENTIFIER}_${gitHubRepoName}_${GITHUB_TAG_NAME}`;

    await client.connect();

    const results = await Promise.allSettled([
      gitHubService.cloneRepoByTag(clonePath),
      client.downloadFiles(downloadsDestinationPath, REMOTE_ENTRY_POINT)
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

    const uploadedFiles = await client.uploadFiles(compareResult);

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
    await client.closeConnection();
  }
}

async function validateEnvVariables() {
  try {
    const FTPEnvs = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'FTP_PORT'];
    const SFTPEnvs = ['SFTP_HOST', 'SFTP_USER', 'SFTP_PASSWORD', 'SFTP_PORT'];

    const coreEnvVars = [
      'SERVER_NAME_UNIQUE_IDENTIFIER',
      'CONNECTION_TYPE',
      'GITHUB_URL',
      'GITHUB_TAG_NAME',
      'REMOTE_ENTRY_POINT',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
      'SMTP_FROM_NAME',
      'SMTP_TO',
      'SMTP_TO_NAME'
    ];

    const requiredEnvVars = [
      ...coreEnvVars,
      ...(CONNECTION_TYPE === ConnectionType.FTP ? FTPEnvs : []),
      ...(CONNECTION_TYPE === ConnectionType.SFTP ? SFTPEnvs : [])
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
