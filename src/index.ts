import { DiffCheckerService } from './services/DiffCheckerService/service.js';
import { SFTPService } from './services/SFTPService/service.js';
import { GitHubService } from './services/GitHubService/index.js';
import {
  DOWNLOADS_DIR,
  OUTPUT_DIR,
  CLONED_REPOSITORIES_DIR
} from './constants/defaultPaths.js';
import {
  GITHUB_TAG_NAME,
  GITHUB_URL,
  REMOTE_ENTRY_POINT,
  SFTP_HOST,
  SFTP_PASSWORD,
  SFTP_PORT,
  SFTP_USER
} from './constants/env.js';
import { SFTP_SERVICE_DEFAULT_OPTIONS } from './services/SFTPService/index.js';
import fs from 'fs';
import { DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS } from './services/DiffCheckerService/constants.js';

async function init() {
  const sftpService = new SFTPService(
    SFTP_HOST,
    SFTP_USER,
    SFTP_PASSWORD,
    SFTP_PORT,
    SFTP_SERVICE_DEFAULT_OPTIONS
  );

  try {
    const startTime = performance.now();

    const gitHubService = new GitHubService(GITHUB_URL, GITHUB_TAG_NAME);
    const gitHubRepoName = gitHubService.getRepoName();

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

    await sftpService.uploadFiles(compareResult);

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} milliseconds`);
  } catch (err) {
    if (err instanceof Error) {
      console.error('An error occurred during initialization:', err.message);
    }
  } finally {
    await sftpService.closeConnection();
  }
}

await init();
