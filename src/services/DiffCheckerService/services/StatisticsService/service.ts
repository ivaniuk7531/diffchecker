import { DifferenceType, IEntry, DiffReason } from '../EntryService/index.js';
import { PermissionDeniedState } from '../PermissionService/index.js';
import {
  IBrokenLinksStatistics,
  IInitialStatistics,
  IPermissionDeniedStatistics,
  IStatistics,
  ISymlinkStatistics
} from './types.js';
import { IExtraOptions } from '../../types.js';

export class StatisticsService {
  private readonly statistics: IInitialStatistics;

  constructor(options: IExtraOptions) {
    let symlinkStatistics: ISymlinkStatistics | undefined = undefined;
    if (options.compareSymlink) {
      symlinkStatistics = {
        distinctSymlinks: 0,
        equalSymlinks: 0,
        leftSymlinks: 0,
        rightSymlinks: 0,
        differencesSymlinks: 0,
        totalSymlinks: 0
      };
    }

    const brokenLinksStatistics: IBrokenLinksStatistics = {
      leftBrokenLinks: 0,
      rightBrokenLinks: 0,
      distinctBrokenLinks: 0,
      totalBrokenLinks: 0
    };

    const permissionDeniedStatistics: IPermissionDeniedStatistics = {
      leftPermissionDenied: 0,
      rightPermissionDenied: 0,
      distinctPermissionDenied: 0,
      totalPermissionDenied: 0
    };

    this.statistics = {
      distinct: 0,
      equal: 0,
      left: 0,
      right: 0,
      distinctFiles: 0,
      equalFiles: 0,
      leftFiles: 0,
      rightFiles: 0,
      distinctDirs: 0,
      equalDirs: 0,
      leftDirs: 0,
      rightDirs: 0,
      brokenLinks: brokenLinksStatistics,
      symlinks: symlinkStatistics,
      permissionDenied: permissionDeniedStatistics
    };
  }

  public getInitialStatistics(): IInitialStatistics {
    return this.statistics;
  }

  public completeStatistics(options: IExtraOptions): IStatistics {
    const statistics: IStatistics = JSON.parse(JSON.stringify(this.statistics));

    statistics.differences =
      statistics.distinct + statistics.left + statistics.right;

    statistics.differencesFiles =
      statistics.distinctFiles + statistics.leftFiles + statistics.rightFiles;

    statistics.differencesDirs =
      statistics.distinctDirs + statistics.leftDirs + statistics.rightDirs;

    statistics.total = statistics.equal + statistics.differences;

    statistics.totalFiles = statistics.equalFiles + statistics.differencesFiles;

    statistics.totalDirs = statistics.equalDirs + statistics.differencesDirs;

    const brokenLinksStats = statistics.brokenLinks;
    brokenLinksStats.totalBrokenLinks =
      brokenLinksStats.leftBrokenLinks +
      brokenLinksStats.rightBrokenLinks +
      brokenLinksStats.distinctBrokenLinks;

    const permissionDeniedStats = statistics.permissionDenied;
    permissionDeniedStats.totalPermissionDenied =
      permissionDeniedStats.leftPermissionDenied +
      permissionDeniedStats.rightPermissionDenied +
      permissionDeniedStats.distinctPermissionDenied;

    statistics.isSame = !statistics.differences;

    if (options.compareSymlink) {
      const symlinkStatistics = statistics.symlinks as ISymlinkStatistics;
      symlinkStatistics.differencesSymlinks =
        symlinkStatistics.distinctSymlinks +
        symlinkStatistics.leftSymlinks +
        symlinkStatistics.rightSymlinks;

      symlinkStatistics.totalSymlinks =
        symlinkStatistics.differencesSymlinks + symlinkStatistics.equalSymlinks;
    }

    return statistics;
  }

  static updateStatisticsBoth(
    entry1: IEntry,
    entry2: IEntry,
    isSame: boolean,
    diffReason: DiffReason | undefined,
    type: DifferenceType,
    permissionDeniedState: PermissionDeniedState,
    statistics: IInitialStatistics,
    options: IExtraOptions
  ): void {
    isSame ? statistics.equal++ : statistics.distinct++;
    if (type === DifferenceType.FILE) {
      isSame ? statistics.equalFiles++ : statistics.distinctFiles++;
    } else if (type === DifferenceType.DIRECTORY) {
      isSame ? statistics.equalDirs++ : statistics.distinctDirs++;
    } else if (type === DifferenceType.BROKEN_LINK) {
      statistics.brokenLinks.distinctBrokenLinks++;
    } else {
      throw new Error('Unexpected type ' + type);
    }

    const isSymlink1 = entry1 ? entry1.isSymlink : false;
    const isSymlink2 = entry2 ? entry2.isSymlink : false;
    const isSymlink = isSymlink1 || isSymlink2;

    if (options.compareSymlink && isSymlink) {
      const symlinkStatistics = statistics.symlinks as ISymlinkStatistics;
      if (diffReason === DiffReason.DIFFERENT_SYMLINK) {
        symlinkStatistics.distinctSymlinks++;
      } else {
        symlinkStatistics.equalSymlinks++;
      }
    }

    if (permissionDeniedState === PermissionDeniedState.ACCESS_ERROR_LEFT) {
      statistics.permissionDenied.leftPermissionDenied++;
    } else if (
      permissionDeniedState === PermissionDeniedState.ACCESS_ERROR_RIGHT
    ) {
      statistics.permissionDenied.rightPermissionDenied++;
    } else if (
      permissionDeniedState === PermissionDeniedState.ACCESS_ERROR_BOTH
    ) {
      statistics.permissionDenied.distinctPermissionDenied++;
    }
  }

  static updateStatisticsLeft(
    entry1: IEntry,
    type: DifferenceType,
    permissionDeniedState: PermissionDeniedState,
    statistics: IInitialStatistics,
    options: IExtraOptions
  ): void {
    statistics.left++;
    if (type === DifferenceType.FILE) {
      statistics.leftFiles++;
    } else if (type === DifferenceType.DIRECTORY) {
      statistics.leftDirs++;
    } else if (type === DifferenceType.BROKEN_LINK) {
      statistics.brokenLinks.leftBrokenLinks++;
    } else {
      throw new Error('Unexpected type ' + type);
    }

    if (options.compareSymlink && entry1.isSymlink) {
      const symlinkStatistics = statistics.symlinks as ISymlinkStatistics;
      symlinkStatistics.leftSymlinks++;
    }

    if (permissionDeniedState === PermissionDeniedState.ACCESS_ERROR_LEFT) {
      statistics.permissionDenied.leftPermissionDenied++;
    }
  }

  static updateStatisticsRight(
    entry2: IEntry,
    type: DifferenceType,
    permissionDeniedState: PermissionDeniedState,
    statistics: IInitialStatistics,
    options: IExtraOptions
  ): void {
    statistics.right++;
    if (type === DifferenceType.FILE) {
      statistics.rightFiles++;
    } else if (type === DifferenceType.DIRECTORY) {
      statistics.rightDirs++;
    } else if (type === DifferenceType.BROKEN_LINK) {
      statistics.brokenLinks.rightBrokenLinks++;
    } else {
      throw new Error('Unexpected type ' + type);
    }

    if (options.compareSymlink && entry2.isSymlink) {
      const symlinkStatistics = statistics.symlinks as ISymlinkStatistics;
      symlinkStatistics.rightSymlinks++;
    }

    if (permissionDeniedState === PermissionDeniedState.ACCESS_ERROR_RIGHT) {
      statistics.permissionDenied.rightPermissionDenied++;
    }
  }
}
