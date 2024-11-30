import dotenv from 'dotenv';

dotenv.config();

export const FTP_HOST = process.env.FTP_HOST;
export const FTP_USER = process.env.FTP_USER;
export const FTP_PASSWORD = process.env.FTP_PASSWORD;
export const FTP_SECURE = process.env.FTP_SECURE === 'true';
export const FTP_VERBOSE = process.env.FTP_VERBOSE === 'true';
export const REMOTE_ENTRY_POINT = process.env.REMOTE_ENTRY_POINT;
export const GITHUB_URL = process.env.GITHUB_URL;
export const GITHUB_TAG_NAME = process.env.GITHUB_TAG_NAME;
export const INCLUDE_FILTER = process.env.INCLUDE_FILTER;
export const EXCLUDE_FILTER = process.env.EXCLUDE_FILTER;
