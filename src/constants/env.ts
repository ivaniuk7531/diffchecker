import dotenv from 'dotenv';

dotenv.config();

export const SFTP_HOST = process.env.SFTP_HOST;
export const SFTP_USER = process.env.SFTP_USER;
export const SFTP_PASSWORD = process.env.SFTP_PASSWORD;
export const SFTP_PORT = process.env.SFTP_PORT;
export const SFTP_DEBUG = process.env.SFTP_DEBUG;

export const REMOTE_ENTRY_POINT = process.env.REMOTE_ENTRY_POINT;

export const GITHUB_URL = process.env.GITHUB_URL;
export const GITHUB_TAG_NAME = process.env.GITHUB_TAG_NAME;

export const INCLUDE_FILTER = process.env.INCLUDE_FILTER;
export const EXCLUDE_FILTER = process.env.EXCLUDE_FILTER;
