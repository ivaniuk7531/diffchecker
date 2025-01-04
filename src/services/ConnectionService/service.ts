import { ConnectionType } from './types.js';
import {
  FTP_SERVICE_DEFAULT_OPTIONS,
  FTPService
} from './services/FTPService/index.js';
import {
  SFTP_SERVICE_DEFAULT_OPTIONS,
  SFTPService
} from './services/SFTPService/index.js';
import {
  FTP_HOST,
  FTP_PASSWORD,
  FTP_PORT,
  FTP_USER,
  SFTP_HOST,
  SFTP_PASSWORD,
  SFTP_PORT,
  SFTP_USER
} from '../../constants/env.js';

export class ConnectionService {
  static getClient(type: ConnectionType) {
    switch (type) {
      case ConnectionType.FTP:
        return new FTPService(
          FTP_HOST,
          FTP_USER,
          FTP_PASSWORD,
          FTP_PORT,
          FTP_SERVICE_DEFAULT_OPTIONS
        );
      case ConnectionType.SFTP:
        return new SFTPService(
          SFTP_HOST,
          SFTP_USER,
          SFTP_PASSWORD,
          SFTP_PORT,
          SFTP_SERVICE_DEFAULT_OPTIONS
        );
      default:
        throw new Error(`Unsupported connection type: ${type}`);
    }
  }
}
