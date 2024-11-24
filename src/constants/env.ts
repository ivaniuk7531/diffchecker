import dotenv from 'dotenv';

dotenv.config();

export const FTP_HOST = process.env.FTP_HOST;
export const FTP_USER = process.env.FTP_USER;
export const FTP_PASSWORD = process.env.FTP_PASSWORD;
export const FTP_SECURE = process.env.FTP_SECURE === 'true';
export const FTP_VERBOSE = process.env.FTP_VERBOSE === 'true';
export const REMOTE_ENTRY_POINT = process.env.REMOTE_ENTRY_POINT;
