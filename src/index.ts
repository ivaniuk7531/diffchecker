import { DiffCheckerService } from './services/DiffCheckerService/service.js';
import { SFTPService } from './services/SFTPService/service.js';
import { GitHubService } from './services/GitHubService/index.js';
import { FileService } from './services/FileService/index.js';
import {
  DOWNLOADS_DIR,
  OUTPUT_DIR,
  REMOTE_CLONED_REPOSITORIES_DIR
} from './constants/defaultPaths.js';
import {
  SFTP_HOST,
  SFTP_PASSWORD,
  SFTP_USER,
  SFTP_PORT,
  GITHUB_TAG_NAME,
  GITHUB_URL,
  REMOTE_ENTRY_POINT
} from './constants/env.js';

async function init() {
  const sftpService = new SFTPService(
    SFTP_HOST,
    SFTP_USER,
    SFTP_PASSWORD,
    SFTP_PORT
  );

  try {
    const gitHubRepoName = GitHubService.getRepoName(GITHUB_URL);

    if (!gitHubRepoName) {
      throw new Error(
        'Failed to extract repository name from the provided URL'
      );
    }

    const cloneDestinationPath = `${OUTPUT_DIR}/${REMOTE_CLONED_REPOSITORIES_DIR}/${gitHubRepoName}`;
    const downloadsDestinationPath = `${OUTPUT_DIR}/${DOWNLOADS_DIR}/${gitHubRepoName}/${GITHUB_TAG_NAME}`;

    if (!FileService.existsSync(OUTPUT_DIR)) {
      FileService.mkdirSync(OUTPUT_DIR);
    }

    FileService.rmSync(`${cloneDestinationPath}/${GITHUB_TAG_NAME}`, {
      force: true,
      recursive: true
    });

    FileService.mkdirSync(cloneDestinationPath, { recursive: true });

    FileService.rmSync(downloadsDestinationPath, {
      force: true,
      recursive: true
    });

    FileService.mkdirSync(downloadsDestinationPath, { recursive: true });

    const gitHubService = new GitHubService();

    await sftpService.connect();

    await Promise.all([
      gitHubService.cloneRepoByTag(
        GITHUB_URL,
        cloneDestinationPath,
        GITHUB_TAG_NAME
      ),
      sftpService.fastDownloadDirectoryRecursively(
        downloadsDestinationPath,
        REMOTE_ENTRY_POINT
      )
    ]);
    console.log('here');
    //
    // const response = await DiffCheckerService.compare(
    //   'diffCheckerOutput/downloads/ojs/3_4_0-7',
    //   'diffCheckerOutput/test/ojs/3_4_0-7',
    //   {
    //     ...DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS,
    //     compareFileHash: true
    //   }
    // );

    // console.log(response.isSame);
  } catch (err) {
    if (err instanceof Error) {
      console.error('An error occurred during initialization:', err.message);
    }
  } finally {
    await sftpService.closeConnection();
  }
}

await init();
