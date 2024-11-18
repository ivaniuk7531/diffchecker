export const TRIM_WHITE_SPACES_REGEXP =
  /^[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+|[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$/g;

export const TRIM_LINE_ENDING_REGEXP = /\r\n|\n$/g;

export const REMOVE_WHITE_SPACES_REGEXP =
  /[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g;

export const BUF_SIZE = 100000;

export const MAX_CONCURRENT_FILE_COMPARE = 8;

export const CONCURRENCY = 2;
