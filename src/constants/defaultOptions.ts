import { IFTPServiceOptions } from '../services/FTPService/index.js';
import { IDiffCheckerServiceOptions } from '../services/DiffCheckerService/index.js';
import { EXCLUDE_FILTER, INCLUDE_FILTER } from './env.js';

const defaultExcludeFilter = [
  '.DS_Store',
  'cache',
  'plugins',
  'upload',
  'files',
  'config.php.inc',
  'public',
  'tests',
  'cypress',
  'docs'
];

export const FTP_SERVICE_DEFAULT_OPTIONS: IFTPServiceOptions = {
  excludeFilter: EXCLUDE_FILTER || defaultExcludeFilter?.join(','),
  includeFilter: INCLUDE_FILTER
};

export const DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS: IDiffCheckerServiceOptions =
  {
    excludeFilter: EXCLUDE_FILTER || defaultExcludeFilter?.join(','),
    includeFilter: INCLUDE_FILTER,
    skipEmptyDirs: true
  };
