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

export const JOB_TIME = process.env.JOB_TIME || '*/30 * * * *';

export const SMTP_SERVICE = process.env.SMTP_SERVICE || 'gmail';
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
export const SMTP_PORT = process.env.SMTP_PORT || 587;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;
export const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME;
export const SMTP_TO = process.env.SMTP_TO;
export const SMTP_TO_NAME = process.env.SMTP_TO_NAME;
