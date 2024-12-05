import dotenv from 'dotenv';

dotenv.config();

export const SFTP_HOST = process.env.SFTP_HOST;
export const SFTP_USER = process.env.SFTP_USER;
export const SFTP_PASSWORD = process.env.SFTP_PASSWORD;
export const SFTP_PORT = process.env.SFTP_PORT;
export const SFTP_DEBUG = process.env.SFTP_DEBUG === 'true';

export const REMOTE_ENTRY_POINT = process.env.REMOTE_ENTRY_POINT;

export const GITHUB_URL = process.env.GITHUB_URL;
export const GITHUB_TAG_NAME = process.env.GITHUB_TAG_NAME;

export const DIFF_CHECKER_INCLUDE_FILTER =
  process.env.DIFF_CHECKER_INCLUDE_FILTER;
export const DIFF_CHECKER_EXCLUDE_FILTER =
  process.env.DIFF_CHECKER_EXCLUDE_FILTER;

export const SFTP_INCLUDE_FILTER = process.env.SFTP_INCLUDE_FILTER;
export const SFTP_EXCLUDE_FILTER = process.env.SFTP_EXCLUDE_FILTER;

export const JOB_TIME = process.env.JOB_TIME;
