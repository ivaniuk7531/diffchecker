import { DiffCheckerService } from './services/DiffCheckerService/service.js';
import { SFTPService } from './services/SFTPService/service.js';
import { GitHubService } from './services/GitHubService/index.js';
import { CronService } from './services/CroneService/index.js';
import fs from 'fs';

import {
  DOWNLOADS_DIR,
  OUTPUT_DIR,
  CLONED_REPOSITORIES_DIR
} from './constants/defaultPaths.js';
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

    if (!gitHubRepoName) {
      throw new Error(
        `GitHub repository name not found. URL: ${GITHUB_URL}, Tag Name: ${GITHUB_TAG_NAME}`
      );
    }

    const cloneDestinationPath = `${OUTPUT_DIR}/${CLONED_REPOSITORIES_DIR}/${gitHubRepoName}/${GITHUB_TAG_NAME}`;
    const downloadsDestinationPath = `${OUTPUT_DIR}/${DOWNLOADS_DIR}/${gitHubRepoName}/${GITHUB_TAG_NAME}`;

    await sftpService.connect();

    fs.rmSync(downloadsDestinationPath, {
      recursive: true,
      force: true
    });
    fs.rmSync(cloneDestinationPath, {
      recursive: true,
      force: true
    });
    fs.mkdirSync(cloneDestinationPath, { recursive: true });

    await Promise.all([
      gitHubService.cloneRepoByTag(cloneDestinationPath),
      sftpService.downloadFiles(downloadsDestinationPath, REMOTE_ENTRY_POINT)
    ]);

    const compareResult = await DiffCheckerService.compare(
      downloadsDestinationPath,
      cloneDestinationPath,
      {
        ...DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS,
        compareContent: true
      }
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

cronService.createJob(JOB_TIME, init, true, true);
