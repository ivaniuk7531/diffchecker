import pathUtils from 'path';
import {
  COMPARE_CONTENT,
  COMPARE_DATE,
  COMPARE_FILE_HASH,
  COMPARE_SIZE,
  DATE_TOLERANCE,
  DIFF_CHECKER_EXCLUDE_FILTER,
  DIFF_CHECKER_INCLUDE_FILTER,
  HASH_ALGORITHM
} from '../../constants/env.js';
import { IDiffCheckerServiceOptions } from './types.js';
import { DEFAULT_EXCLUDE_FILTER } from '../../constants/defaultExcludeFilter.js';
import { HashAlgorithms } from './services/EntryService/index.js';

export const ROOT_PATH = pathUtils.sep;

export const DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS: IDiffCheckerServiceOptions =
  {
    compareSize: COMPARE_SIZE,
    compareFileHash: COMPARE_FILE_HASH,
    hashAlgorithm: (HASH_ALGORITHM || HashAlgorithms.sha1) as HashAlgorithms,
    compareContent: COMPARE_CONTENT,
    compareDate: COMPARE_DATE,
    dateTolerance: DATE_TOLERANCE,
    includeFilter: DIFF_CHECKER_INCLUDE_FILTER,
    excludeFilter:
      DIFF_CHECKER_EXCLUDE_FILTER || DEFAULT_EXCLUDE_FILTER?.join(','),
    handlePermissionDenied: true,
    skipSymlinks: true,
    skipEmptyDirs: true
  };
