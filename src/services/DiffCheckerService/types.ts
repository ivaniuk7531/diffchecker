import {
  IInitialStatistics,
  IStatistics
} from './services/StatisticsService/index.js';
import {
  DifferenceState,
  DiffSet,
  IEntry,
  DiffReason,
  DifferenceType,
  HashAlgorithms
} from './services/EntryService/index.js';
import { PermissionDeniedState } from './services/PermissionService/index.js';
import fs, { Stats } from 'fs';

export type RealPathOptions =
  | { encoding?: BufferEncoding | null }
  | BufferEncoding;

export interface IDiffCheckerServiceOptions {
  [key: string]: any;

  /**
   * Compares files by size. Defaults to 'false'.
   *
   * Usually one of `compareSize` or `compareContent` or `compareFileHash` options has to be activated. Otherwise files are compared by name disregarding size or content.
   */
  compareSize?: boolean;

  /**
   * Compares files by file hash. Defaults to 'false'.
   *
   * Usually one of `compareSize` or `compareContent` or `compareFileHash` options has to be activated. Otherwise files are compared by name disregarding size or content.
   */
  compareFileHash?: boolean;

  /**
   * The hashing algorithms are used to generate a fixed-size hash value from the file. Defaults to 'sha1'.
   */
  hashAlgorithm?: HashAlgorithms;

  /**
   * Compares files by content. Defaults to 'true'.
   *
   * Usually one of `compareSize` or `compareContent` or `compareFileHash` options has to be activated. Otherwise files are compared by name disregarding size or content.
   */
  compareContent?: boolean;

  /**
   * Compares files by date of modification (stat.mtime). Defaults to 'false'.
   *
   */
  compareDate?: boolean;

  /**
   * Two files are considered to have the same date if the difference between their modification dates fits within date tolerance. Defaults to 1000 ms.
   */
  dateTolerance?: number;

  /**
   * Compares entries by symlink. Defaults to 'false'.

   * If this option is enabled two entries must have the same type in order to be considered equal.
   * They have to be either two fies, two directories or two symlinks.
   *
   * If left entry is a file and right entry is a symlink, they are considered distinct disregarding the content of the file.
   *
   * Further if both entries are symlinks they need to have the same link value. For example if one symlink points to '/x/b.txt' and the other to '/x/../x/b.txt' the symlinks are considered distinct even if they point to the same file.
   */
  compareSymlink?: boolean;

  /**
   * Skips sub directories. Defaults to 'false'.
   */
  skipSubdirs?: boolean;

  /**
   * Ignore empty directories. Defaults to 'false'.
   */
  skipEmptyDirs?: boolean;

  /**
   * Ignore symbolic links. Defaults to 'false'.
   */
  skipSymlinks?: boolean;

  /**
   * Toggles presence of diffSet in output. If true, only statistics are provided. Use this when comparing large number of files to avoid out of memory situations. Defaults to 'false'.
   */
  noDiffSet?: boolean;

  /**
   * File name filter. Comma separated minimatch patterns.
   */
  includeFilter?: string;

  /**
   * File/directory name exclude filter. Comma separated minimatch patterns.
   */
  excludeFilter?: string;

  /**
   * Handle permission denied errors. Defaults to 'false'.
   *
   * By default when some entry cannot be read due to `EACCES` error the comparison will
   * stop immediately with an exception.
   *
   * If `handlePermissionDenied` is set to true the comparison will continue when unreadable entries are encountered.
   */
  handlePermissionDenied?: boolean;

  resultBuilder?: ResultBuilder;

  compareFileSync?: CompareFileSync;

  compareFileAsync?: CompareFileAsync;

  compareNameHandler?: CompareNameHandler;

  filterHandler?: FilterHandler;
}

export interface IExtraOptions extends IDiffCheckerServiceOptions {
  dateTolerance: number;
  resultBuilder: ResultBuilder;
  compareFileSync: CompareFileSync;
  compareFileAsync: CompareFileAsync;
  compareNameHandler: CompareNameHandler;
  filterHandler: FilterHandler;
}

export type CompareInfo = {
  modeMore: CompareMode;
  type1: DifferenceType;
  type2: DifferenceType;
  size1: number;
  size2: number;
  date1: Date;
  date2: Date;
};

export enum CompareMode {
  DIRECTORIES = 'DIRECTORIES',
  FILES = 'FILES',
  MIXED = 'MIXED'
}

export interface IStatisticsResults extends IStatistics {
  diffSet?: DiffSet;
}

export type ResultBuilder = (
  entry1: IEntry | undefined,
  entry2: IEntry | undefined,
  state: DifferenceState,
  level: number,
  relativePath: string,
  options: IDiffCheckerServiceOptions,
  statistics: IInitialStatistics,
  diffSet: DiffSet | undefined,
  diffReason: DiffReason | undefined,
  permissionDeniedState: PermissionDeniedState
) => void;

export type CompareFileSync = (
  path1: string,
  stat1: fs.Stats,
  path2: string,
  stat2: fs.Stats,
  options: IDiffCheckerServiceOptions
) => boolean;

export type CompareFileAsync = (
  path1: string,
  stat1: Stats,
  path2: string,
  stat2: fs.Stats,
  options: IDiffCheckerServiceOptions
) => Promise<boolean>;

export type CompareNameHandler = (
  name1: string,
  name2: string,
  options: IDiffCheckerServiceOptions
) => 0 | 1 | -1;

export type FilterHandler = (
  entry: IEntry,
  relativePath: string,
  options: IDiffCheckerServiceOptions
) => boolean;
