import { FTPService } from './services/FTPService/index.js';
import {
  FTP_HOST,
  FTP_PASSWORD,
  FTP_SECURE,
  FTP_USER,
  FTP_VERBOSE,
  REMOTE_ENTRY_POINT
} from './constants/env.js';
import { FTPServiceDefaultOptions } from './constants/defaultOptions.js';

async function init() {
  const ftpService = new FTPService(
    FTP_HOST,
    FTP_USER,
    FTP_PASSWORD,
    FTP_SECURE,
    FTP_VERBOSE,
    FTPServiceDefaultOptions
  );

  try {
    await ftpService.connect();
    await ftpService.downloadDirectoryRecursively(
      './test/dir1/',
      REMOTE_ENTRY_POINT
    );
  } catch (err) {
    console.log(err);
  } finally {
    ftpService.closeConnection();
  }
}

await init();
