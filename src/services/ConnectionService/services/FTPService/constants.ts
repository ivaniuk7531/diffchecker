import {
  FTP_DEBUG,
  FTP_EXCLUDE_FILTER,
  FTP_INCLUDE_FILTER
} from '../../../../constants/env.js';
import { IFTPServiceOptions } from './types.js';
import { DEFAULT_EXCLUDE_FILTER } from '../../../../constants/defaultExcludeFilter.js';

export const FTP_SERVICE_DEFAULT_OPTIONS: IFTPServiceOptions = {
  excludeFilter: FTP_EXCLUDE_FILTER || DEFAULT_EXCLUDE_FILTER?.join(','),
  includeFilter: FTP_INCLUDE_FILTER,
  debug: FTP_DEBUG
};
