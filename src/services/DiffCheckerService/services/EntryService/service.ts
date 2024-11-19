import pathUtils from 'path';
import pLimit from 'p-limit';
import {
  createHashFromFile,
  filterEntry,
  getStatIgnoreBrokenLink,
  hasPermissionDenied,
  isBrokenLinkEqual,
  isDirectoryEqual,
  isFileEqualAsync
} from './utils.js';
import {
  AsyncDiffSet,
  DifferenceState,
  DifferenceType,
  DiffSet,
  IEntry,
  EntryOrigin,
  FileEqualityAsync,
  FileEqualityPromise,
  OptionalDiffSet,
  OptionalEntry,
  DiffReason
} from './types.js';
import { FileSystemService } from '../FileSystemService/index.js';
import { SymlinkCache, SymlinkService } from '../SymlinkService/index.js';
import {
  PermissionDeniedState,
  PermissionService
} from '../PermissionService/index.js';
import {
  IInitialStatistics,
  StatisticsService
} from '../StatisticsService/index.js';

import { PATH_SEP } from './constants.js';
import fs from 'fs';
import { CONCURRENCY } from '../ComparisonService/constants.js';
import { CompareInfo, CompareMode, IExtraOptions } from '../../types.js';

export class EntryService {
  static async buildEntry(
    absolutePath: string,
    path: string,
    name: string,
    origin: EntryOrigin,
    options: IExtraOptions
  ): Promise<IEntry> {
    const stats = getStatIgnoreBrokenLink(absolutePath);
    const isDirectory = stats.stat.isDirectory();
    const isFile = !isDirectory;

    let isPermissionDenied = false;
    let fileHash: null | string = null;

    if (options.handlePermissionDenied) {
      isPermissionDenied = hasPermissionDenied(absolutePath, isFile, options);
    }

    if (isFile) {
      fileHash = await createHashFromFile(absolutePath);
    }

    return {
      name,
      absolutePath,
      path,
      origin,
      fileHash,
      stat: stats.stat,
      lstat: stats.lstat,
      isSymlink: stats.lstat.isSymbolicLink(),
      isBrokenLink: stats.isBrokenLink,
      isDirectory,
      isPermissionDenied
    };
  }

  static async #buildDirEntries(
    rootEntry: IEntry,
    dirEntries: string[],
    relativePath: string,
    origin: EntryOrigin,
    options: IExtraOptions
  ): Promise<IEntry[]> {
    const res: IEntry[] = [];
    for (let i = 0; i < dirEntries.length; i++) {
      const entryName = dirEntries[i];
      const entryAbsolutePath = rootEntry.absolutePath + PATH_SEP + entryName;
      const entryPath = rootEntry.path + PATH_SEP + entryName;

      const entry = await this.buildEntry(
        entryAbsolutePath,
        entryPath,
        entryName,
        origin,
        options
      );

      if (filterEntry(entry, relativePath, options)) {
        res.push(entry);
      }
    }
    return res.sort((a, b) => this.#compareEntry(a, b, options));
  }

  static #isEntryEqualAsync(
    entry1: IEntry,
    entry2: IEntry,
    type: DifferenceType,
    asyncDiffSet: AsyncDiffSet,
    options: IExtraOptions
  ): FileEqualityPromise {
    if (type === DifferenceType.FILE) {
      return isFileEqualAsync(entry1, entry2, type, asyncDiffSet, options);
    }
    if (type === DifferenceType.DIRECTORY) {
      return { isSync: true, ...isDirectoryEqual(entry1, entry2, options) };
    }
    if (type === DifferenceType.BROKEN_LINK) {
      return { isSync: true, ...isBrokenLinkEqual() };
    }
    throw new Error('Unexpected type ' + type);
  }

  static #compareEntry(a: IEntry, b: IEntry, options: IExtraOptions): number {
    if (a.isBrokenLink && b.isBrokenLink) {
      return options.compareNameHandler(a.name, b.name, options);
    } else if (a.isBrokenLink) {
      return -1;
    } else if (b.isBrokenLink) {
      return 1;
    } else if (a.stat.isDirectory() && b.stat.isFile()) {
      return -1;
    } else if (a.stat.isFile() && b.stat.isDirectory()) {
      return 1;
    } else {
      return options.compareNameHandler(a.name, b.name, options);
    }
  }

  static getType(entry: OptionalEntry): DifferenceType {
    if (!entry) {
      return DifferenceType.MISSING;
    }
    if (entry.isBrokenLink) {
      return DifferenceType.BROKEN_LINK;
    }
    if (entry.isDirectory) {
      return DifferenceType.DIRECTORY;
    }
    return DifferenceType.FILE;
  }

  static async compareDirEntriesAsync(
    rootEntry1: OptionalEntry,
    rootEntry2: OptionalEntry,
    level: number,
    relativePath: string,
    options: IExtraOptions,
    statistics: IInitialStatistics,
    asyncDiffSet: AsyncDiffSet,
    symlinkCache: SymlinkCache
  ): Promise<void> {
    const limit = pLimit(CONCURRENCY);
    const loopDetected1 = SymlinkService.detectLoop(
      rootEntry1,
      symlinkCache.dir1
    );
    const loopDetected2 = SymlinkService.detectLoop(
      rootEntry2,
      symlinkCache.dir2
    );
    SymlinkService.updateSymlinkCache(
      symlinkCache,
      rootEntry1,
      rootEntry2,
      loopDetected1,
      loopDetected2
    );

    const entriesResult = await Promise.all([
      this.#getEntries(
        rootEntry1,
        relativePath,
        loopDetected1,
        EntryOrigin.LEFT,
        options
      ),
      this.#getEntries(
        rootEntry2,
        relativePath,
        loopDetected2,
        EntryOrigin.RIGHT,
        options
      )
    ]);
    const entries1 = entriesResult[0];
    const entries2 = entriesResult[1];
    let i1 = 0,
      i2 = 0;
    const comparePromises: Promise<void>[] = [];
    const fileEqualityAsyncPromises: Promise<FileEqualityAsync>[] = [];
    while (i1 < entries1.length || i2 < entries2.length) {
      const entry1 = entries1[i1];
      const entry2 = entries2[i2];
      let type1, type2;

      // compare entry name (-1, 0, 1)
      let cmp;
      if (i1 < entries1.length && i2 < entries2.length) {
        cmp = this.#compareEntry(entry1, entry2, options);
        type1 = this.getType(entry1);
        type2 = this.getType(entry2);
      } else if (i1 < entries1.length) {
        type1 = this.getType(entry1);
        type2 = this.getType(undefined);
        cmp = -1;
      } else {
        type1 = this.getType(undefined);
        type2 = this.getType(entry2);
        cmp = 1;
      }

      // process entry
      if (cmp === 0) {
        // Both left/right exist and have the same name and type
        const skipEntry =
          options.skipSubdirs && type1 === DifferenceType.DIRECTORY;
        if (!skipEntry) {
          const permissionDeniedState =
            PermissionService.getPermissionDeniedState(entry1, entry2);

          if (permissionDeniedState === PermissionDeniedState.ACCESS_OK) {
            const compareEntryRes = this.#isEntryEqualAsync(
              entry1,
              entry2,
              type1,
              asyncDiffSet,
              options
            );
            if (compareEntryRes.isSync) {
              options.resultBuilder(
                entry1,
                entry2,
                compareEntryRes.isSame
                  ? DifferenceState.EQUAL
                  : DifferenceState.DISTINCT,
                level,
                relativePath,
                options,
                statistics,
                asyncDiffSet as DiffSet,
                compareEntryRes.diffReason,
                permissionDeniedState
              );
              StatisticsService.updateStatisticsBoth(
                entry1,
                entry2,
                compareEntryRes.isSame,
                compareEntryRes.diffReason,
                type1,
                permissionDeniedState,
                statistics,
                options
              );
            } else {
              fileEqualityAsyncPromises.push(
                compareEntryRes.fileEqualityAsyncPromise
              );
            }
          } else {
            const state = DifferenceState.DISTINCT;
            const diffReason = DiffReason.PERMISSION_DENIED;
            const isSame = false;
            options.resultBuilder(
              entry1,
              entry2,
              state,
              level,
              relativePath,
              options,
              statistics,
              asyncDiffSet as DiffSet,
              diffReason,
              permissionDeniedState
            );
            StatisticsService.updateStatisticsBoth(
              entry1,
              entry2,
              isSame,
              diffReason,
              type1,
              permissionDeniedState,
              statistics,
              options
            );
          }
          if (type1 === DifferenceType.DIRECTORY) {
            const subDiffSet: AsyncDiffSet = [];
            if (!options.noDiffSet) {
              asyncDiffSet.push(subDiffSet);
            }
            const comparePromise = limit(() =>
              this.compareDirEntriesAsync(
                entry1,
                entry2,
                level + 1,
                pathUtils.join(relativePath, entry1.name),
                options,
                statistics,
                subDiffSet,
                SymlinkService.cloneSymlinkCache(symlinkCache)
              )
            );
            comparePromises.push(comparePromise);
          }
        }
        i1++;
        i2++;
      } else if (cmp < 0) {
        // Right missing
        const skipEntry_1 =
          options.skipSubdirs && type1 === DifferenceType.DIRECTORY;
        if (!skipEntry_1) {
          const permissionDeniedState_1 =
            PermissionService.getPermissionDeniedStateWhenRightMissing(entry1);
          options.resultBuilder(
            entry1,
            undefined,
            DifferenceState.LEFT,
            level,
            relativePath,
            options,
            statistics,
            asyncDiffSet as DiffSet,
            undefined,
            permissionDeniedState_1
          );
          StatisticsService.updateStatisticsLeft(
            entry1,
            type1,
            permissionDeniedState_1,
            statistics,
            options
          );
          if (type1 === DifferenceType.DIRECTORY) {
            const subDiffSet_1: AsyncDiffSet = [];
            if (!options.noDiffSet) {
              asyncDiffSet.push(subDiffSet_1);
            }
            const comparePromise_1 = limit(() =>
              this.compareDirEntriesAsync(
                entry1,
                undefined,
                level + 1,
                pathUtils.join(relativePath, entry1.name),
                options,
                statistics,
                subDiffSet_1,
                SymlinkService.cloneSymlinkCache(symlinkCache)
              )
            );
            comparePromises.push(comparePromise_1);
          }
        }
        i1++;
      } else {
        // Left missing
        const skipEntry_2 =
          options.skipSubdirs && type2 === DifferenceType.DIRECTORY;
        if (!skipEntry_2) {
          const permissionDeniedState_2 =
            PermissionService.getPermissionDeniedStateWhenLeftMissing(entry2);
          options.resultBuilder(
            undefined,
            entry2,
            DifferenceState.RIGHT,
            level,
            relativePath,
            options,
            statistics,
            asyncDiffSet as DiffSet,
            undefined,
            permissionDeniedState_2
          );
          StatisticsService.updateStatisticsRight(
            entry2,
            type2,
            permissionDeniedState_2,
            statistics,
            options
          );
          if (type2 === DifferenceType.DIRECTORY) {
            const subDiffSet_2: AsyncDiffSet = [];
            if (!options.noDiffSet) {
              asyncDiffSet.push(subDiffSet_2);
            }
            const comparePromise_2 = limit(() =>
              this.compareDirEntriesAsync(
                undefined,
                entry2,
                level + 1,
                pathUtils.join(relativePath, entry2.name),
                options,
                statistics,
                subDiffSet_2,
                SymlinkService.cloneSymlinkCache(symlinkCache)
              )
            );
            comparePromises.push(comparePromise_2);
          }
        }
        i2++;
      }
    }
    await Promise.all(comparePromises);
    const fileEqualityAsyncResults = await Promise.all(
      fileEqualityAsyncPromises
    );
    for (let i = 0; i < fileEqualityAsyncResults.length; i++) {
      const fileEqualityAsync = fileEqualityAsyncResults[i];
      if (fileEqualityAsync.hasErrors) {
        return Promise.reject(fileEqualityAsync.error);
      }
      const permissionDeniedState_3 = PermissionDeniedState.ACCESS_OK;
      options.resultBuilder(
        fileEqualityAsync.context.entry1,
        fileEqualityAsync.context.entry2,
        fileEqualityAsync.isSame
          ? DifferenceState.EQUAL
          : DifferenceState.DISTINCT,
        level,
        relativePath,
        options,
        statistics,
        fileEqualityAsync.context.asyncDiffSet as DiffSet,
        fileEqualityAsync.diffReason,
        permissionDeniedState_3
      );
      StatisticsService.updateStatisticsBoth(
        fileEqualityAsync.context.entry1,
        fileEqualityAsync.context.entry2,
        fileEqualityAsync.isSame,
        fileEqualityAsync.diffReason,
        fileEqualityAsync.context.type1,
        permissionDeniedState_3,
        statistics,
        options
      );
    }
  }

  static compareMixedEntries(
    path1: string,
    path2: string,
    diffSet: OptionalDiffSet,
    initialStatistics: IInitialStatistics,
    compareInfo: CompareInfo
  ): void {
    initialStatistics.distinct = 2;
    initialStatistics.distinctDirs = 1;
    initialStatistics.distinctFiles = 1;
    if (diffSet) {
      diffSet.push({
        path1,
        path2,
        relativePath: '',
        name1: pathUtils.basename(path1),
        name2: pathUtils.basename(path2),
        state: DifferenceState.DISTINCT,
        permissionDeniedState: PermissionDeniedState.ACCESS_OK,
        type1: compareInfo.type1,
        type2: compareInfo.type2,
        level: 0,
        size1: compareInfo.size1,
        size2: compareInfo.size2,
        date1: compareInfo.date1,
        date2: compareInfo.date2,
        diffReason: DiffReason.DIFFERENT_CONTENT
      });
    }
  }

  static async #getEntries(
    rootEntry: OptionalEntry,
    relativePath: string,
    loopDetected: boolean,
    origin: EntryOrigin,
    options: IExtraOptions
  ): Promise<IEntry[]> {
    if (!rootEntry || loopDetected) {
      return Promise.resolve([]);
    }
    if (rootEntry.isDirectory) {
      if (rootEntry.isPermissionDenied) {
        return Promise.resolve([]);
      }
      const entries = await FileSystemService.readdir(rootEntry.absolutePath);
      return this.#buildDirEntries(
        rootEntry,
        entries,
        relativePath,
        origin,
        options
      );
    }
    return Promise.resolve([rootEntry]);
  }

  static getEntryCompareInfo(path1: string, path2: string): CompareInfo {
    const stat1 = fs.lstatSync(path1);
    const stat2 = fs.lstatSync(path2);
    if (stat1.isDirectory() && stat2.isDirectory()) {
      return {
        modeMore: CompareMode.DIRECTORIES,
        type1: DifferenceType.DIRECTORY,
        type2: DifferenceType.DIRECTORY,
        size1: stat1.size,
        size2: stat2.size,
        date1: stat1.mtime,
        date2: stat2.mtime
      };
    }
    if (stat1.isFile() && stat2.isFile()) {
      return {
        modeMore: CompareMode.FILES,
        type1: DifferenceType.FILE,
        type2: DifferenceType.FILE,
        size1: stat1.size,
        size2: stat2.size,
        date1: stat1.mtime,
        date2: stat2.mtime
      };
    }
    return {
      modeMore: CompareMode.MIXED,
      type1: stat1.isFile() ? DifferenceType.FILE : DifferenceType.DIRECTORY,
      type2: stat2.isFile() ? DifferenceType.FILE : DifferenceType.DIRECTORY,
      size1: stat1.size,
      size2: stat2.size,
      date1: stat1.mtime,
      date2: stat2.mtime
    };
  }
}
