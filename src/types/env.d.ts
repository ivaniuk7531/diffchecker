declare namespace NodeJS {
  interface ProcessEnv {
    FTP_HOST: string;
    FTP_USER: string;
    FTP_PASSWORD: string;
    FTP_SECURE: 'true' | 'false';
    FTP_VERBOSE: 'true' | 'false';
    REMOTE_ENTRY_POINT: string;
    GITHUB_URL: string;
    GITHUB_TAG_NAME: string;
    INCLUDE_FILTER: string;
    EXCLUDE_FILTER: string;
  }
}
