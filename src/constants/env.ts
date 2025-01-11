import dotenv from 'dotenv';
import { ConnectionType } from '../services/ConnectionService/index.js';

dotenv.config();

export const SERVER_NAME_UNIQUE_IDENTIFIER = process.env
  .SERVER_NAME_UNIQUE_IDENTIFIER as ConnectionType;
export const CONNECTION_TYPE = process.env.CONNECTION_TYPE as ConnectionType;

export const FTP_HOST = process.env.FTP_HOST;
export const FTP_USER = process.env.FTP_USER;
export const FTP_PASSWORD = process.env.FTP_PASSWORD;
export const FTP_PORT = +(process.env.FTP_PORT || 21);
export const FTP_DEBUG = process.env.FTP_DEBUG === 'true';

export const SFTP_HOST = process.env.SFTP_HOST;
export const SFTP_USER = process.env.SFTP_USER;
export const SFTP_PASSWORD = process.env.SFTP_PASSWORD;
export const SFTP_PORT = +(process.env.SFTP_PORT || 22);
export const SFTP_DEBUG = process.env.SFTP_DEBUG === 'true';

export const REMOTE_ENTRY_POINT = process.env.REMOTE_ENTRY_POINT;

export const GITHUB_URL = process.env.GITHUB_URL;
export const GITHUB_TAG_NAME = process.env.GITHUB_TAG_NAME;
export const COMPARE_SIZE = process.env.COMPARE_SIZE === 'true';
export const COMPARE_FILE_HASH = process.env.COMPARE_FILE_HASH === 'true';
export const HASH_ALGORITHM = process.env.HASH_ALGORITHM;
export const COMPARE_CONTENT = process.env.COMPARE_CONTENT === 'true';
export const COMPARE_DATE = process.env.COMPARE_DATE === 'true';
export const DATE_TOLERANCE = +(process.env.DATE_TOLERANCE || 1000);
export const DIFF_CHECKER_INCLUDE_FILTER =
  process.env.DIFF_CHECKER_INCLUDE_FILTER;
export const DIFF_CHECKER_EXCLUDE_FILTER =
  process.env.DIFF_CHECKER_EXCLUDE_FILTER;

export const SFTP_INCLUDE_FILTER = process.env.SFTP_INCLUDE_FILTER;
export const SFTP_EXCLUDE_FILTER = process.env.SFTP_EXCLUDE_FILTER;

export const FTP_INCLUDE_FILTER = process.env.FTP_INCLUDE_FILTER;
export const FTP_EXCLUDE_FILTER = process.env.FTP_EXCLUDE_FILTER;

export const JOB_TIME = process.env.JOB_TIME || '*/30 * * * *';

export const SMTP_SERVICE = process.env.SMTP_SERVICE || 'gmail';
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
export const SMTP_PORT = +(process.env.SMTP_PORT || 587);
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;
export const SMTP_TO = process.env.SMTP_TO;
