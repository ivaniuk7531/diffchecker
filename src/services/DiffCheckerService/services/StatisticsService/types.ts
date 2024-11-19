export interface IInitialStatistics {
  [key: string]: any;

  distinct: number;

  equal: number;

  left: number;

  right: number;

  distinctFiles: number;

  equalFiles: number;

  leftFiles: number;

  rightFiles: number;

  distinctDirs: number;

  equalDirs: number;

  leftDirs: number;

  rightDirs: number;

  brokenLinks: IBrokenLinksStatistics;

  symlinks?: ISymlinkStatistics;

  permissionDenied: IPermissionDeniedStatistics;
}

export interface IStatistics extends IInitialStatistics {
  isSame: boolean;

  differences: number;

  total: number;

  differencesFiles: number;

  totalFiles: number;

  differencesDirs: number;

  totalDirs: number;
}

export interface IBrokenLinksStatistics {
  leftBrokenLinks: number;

  rightBrokenLinks: number;

  distinctBrokenLinks: number;

  totalBrokenLinks: number;
}

export interface IPermissionDeniedStatistics {
  leftPermissionDenied: number;

  rightPermissionDenied: number;

  distinctPermissionDenied: number;

  totalPermissionDenied: number;
}

export interface ISymlinkStatistics {
  distinctSymlinks: number;

  equalSymlinks: number;

  leftSymlinks: number;

  rightSymlinks: number;

  differencesSymlinks: number;

  totalSymlinks: number;
}
