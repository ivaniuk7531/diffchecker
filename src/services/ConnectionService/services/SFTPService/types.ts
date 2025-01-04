export interface ISFTPServiceOptions {
  /**
   * File name filter. Comma separated minimatch patterns.
   */
  includeFilter?: string;

  /**
   * File/directory name exclude filter. Comma separated minimatch patterns.
   */
  excludeFilter?: string;
}
