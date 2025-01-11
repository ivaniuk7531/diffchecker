declare namespace NodeJS {
  type BooleanString = 'true' | 'false';

  interface ProcessEnv {
    SERVER_NAME_UNIQUE_IDENTIFIER: string;
    CONNECTION_TYPE: string;

    FTP_HOST: string;
    FTP_USER: string;
    FTP_PASSWORD: string;
    FTP_PORT: number;
    FTP_DEBUG: BooleanString;

    SFTP_HOST: string;
    SFTP_USER: string;
    SFTP_PASSWORD: string;
    SFTP_PORT: number;
    SFTP_DEBUG: BooleanString;

    REMOTE_ENTRY_POINT: string;

    GITHUB_URL: string;
    GITHUB_TAG_NAME: string;

    FTP_INCLUDE_FILTER: string;
    FTP_EXCLUDE_FILTER: string;

    SFTP_INCLUDE_FILTER: string;
    SFTP_EXCLUDE_FILTER: string;

    COMPARE_SIZE: BooleanString;
    COMPARE_FILE_HASH: BooleanString;
    HASH_ALGORITHM: string;
    COMPARE_CONTENT: BooleanString;
    COMPARE_DATE: BooleanString;
    DATE_TOLERANCE: number;
    DIFF_CHECKER_INCLUDE_FILTER: string;
    DIFF_CHECKER_EXCLUDE_FILTER: string;

    JOB_TIME: string;

    SMTP_SERVICE: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
    SMTP_TO: string;
  }
}
