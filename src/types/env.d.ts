declare namespace NodeJS {
  interface ProcessEnv {
    SFTP_HOST: string;
    SFTP_USER: string;
    SFTP_PASSWORD: string;
    SFTP_PORT: number;
    SFTP_DEBUG: 'true' | 'false';

    REMOTE_ENTRY_POINT: string;

    GITHUB_URL: string;
    GITHUB_TAG_NAME: string;

    INCLUDE_FILTER: string;
    EXCLUDE_FILTER: string;
  }
}