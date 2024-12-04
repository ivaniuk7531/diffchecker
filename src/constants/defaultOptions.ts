import { ISFTPServiceOptions } from '../services/SFTPService/index.js';
import { IDiffCheckerServiceOptions } from '../services/DiffCheckerService/index.js';
import {
  DIFF_CHECKER_EXCLUDE_FILTER,
  DIFF_CHECKER_INCLUDE_FILTER,
  SFTP_EXCLUDE_FILTER,
  SFTP_INCLUDE_FILTER
} from './env.js';

const defaultExcludeFilter = [
  '.git',
  // '.gitignore',
  '.github'
  // '.DS_Store',
  // 'cache',
  // 'plugins',
  // 'plugins',
  // 'classes',
  // 'dbscripts',
  // 'pages',
  // 'registry',
  // 'schemas',
  // 'templates',
  // 'files',
  // 'public',
  // 'tests',
  // 'cypress',
  // 'cypress.*',
  // 'config.inc.php',
  // 'README.md',
  // 'SECURITY.md',
  // 'package-lock.json',
  // '*.ico'
];

export const SFTP_SERVICE_DEFAULT_OPTIONS: ISFTPServiceOptions = {
  excludeFilter: SFTP_EXCLUDE_FILTER || defaultExcludeFilter?.join(','),
  includeFilter: SFTP_INCLUDE_FILTER
};

export const DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS: IDiffCheckerServiceOptions =
  {
    excludeFilter:
      DIFF_CHECKER_EXCLUDE_FILTER || defaultExcludeFilter?.join(','),
    includeFilter: DIFF_CHECKER_INCLUDE_FILTER,
    skipEmptyDirs: true
  };
