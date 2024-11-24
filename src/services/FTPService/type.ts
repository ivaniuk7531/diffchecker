export interface IFTPServiceOptions {
  /**
   * File name filter. Array with minimatch patterns.
   */
  includeFilter?: string[];

  /**
   * File/directory name exclude filter. Array with minimatch patterns.
   */
  excludeFilter?: string[];
}
