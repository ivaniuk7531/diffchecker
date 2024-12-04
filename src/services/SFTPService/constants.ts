import {
  SFTP_EXCLUDE_FILTER,
  SFTP_INCLUDE_FILTER
} from '../../constants/env.js';
import { ISFTPServiceOptions } from './type.js';
import { DEFAULT_EXCLUDE_FILTER } from '../../constants/defaultExcludeFilter.js';

export const DOWNLOAD_CONCURRENCY = 9;
export const UPLOAD_CONCURRENCY = 9;

export const SFTP_SERVICE_DEFAULT_OPTIONS: ISFTPServiceOptions = {
  excludeFilter: SFTP_EXCLUDE_FILTER || DEFAULT_EXCLUDE_FILTER?.join(','),
  includeFilter: SFTP_INCLUDE_FILTER
};
