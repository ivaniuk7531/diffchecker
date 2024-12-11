import pathUtils from 'path';
import {
  DIFF_CHECKER_EXCLUDE_FILTER,
  DIFF_CHECKER_INCLUDE_FILTER
} from '../../constants/env.js';
import { IDiffCheckerServiceOptions } from './types.js';
import { DEFAULT_EXCLUDE_FILTER } from '../../constants/defaultExcludeFilter.js';

export const ROOT_PATH = pathUtils.sep;

export const DIFF_CHECKER_DEFAULT_SERVICE_OPTIONS: IDiffCheckerServiceOptions =
  {
    excludeFilter:
      DIFF_CHECKER_EXCLUDE_FILTER || DEFAULT_EXCLUDE_FILTER?.join(','),
    includeFilter: DIFF_CHECKER_INCLUDE_FILTER,
    handlePermissionDenied: true,
    skipSymlinks: true,
    skipEmptyDirs: true,
    compareContent: true
  };
