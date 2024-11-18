import pathUtils from 'path';
import {
  AsyncDiffSet,
  DifferenceState,
  DiffSet,
  IEntry,
  EntryOrigin,
  EntryService,
  OptionalDiffSet,
  DiffReason
} from './serivices/EntryService/index.js';
import {
  IStatistics,
  StatisticsService
} from './serivices/StatisticsService/index.js';
import { ROOT_PATH } from './constants.js';
import { SymlinkService } from './serivices/SymlinkService/index.js';
import { ComparisonService } from './serivices/ComparisonService/index.js';
import { FilterService } from './serivices/FilterService/service.js';
import { realPath } from './utils.js';
import {
  CompareInfo,
  IExtraOptions,
  FilterHandler,
  IOptions,
  IStatisticsResults,
  ResultBuilder,
  CompareMode
} from './types.js';
import { PermissionDeniedState } from './serivices/PermissionService/index.js';

export class DiffCheckerService {
  static async compare(
    path1: string,
    path2: string,
    options?: IOptions
  ): Promise<IStatisticsResults> {
    const realPaths = await Promise.all([realPath(path1), realPath(path2)]);
    const realPath1 = realPaths[0];
    const realPath2 = realPaths[1];
    const absolutePath1 = pathUtils.normalize(pathUtils.resolve(realPath1));
    const absolutePath2 = pathUtils.normalize(pathUtils.resolve(realPath2));
    const compareInfo = EntryService.getEntryCompareInfo(
      absolutePath1,
      absolutePath2
    );
    const extOptions = this.#prepareOptions(compareInfo, options);

    const asyncDiffSet: AsyncDiffSet = [];
    const statisticsService = new StatisticsService(extOptions);
    const initialStatistics = statisticsService.getInitialStatistics();

    if (compareInfo.modeMore === CompareMode.MIXED) {
      let diffSet: OptionalDiffSet;
      if (!extOptions.noDiffSet) {
        diffSet = [];
      }
      EntryService.compareMixedEntries(
        absolutePath1,
        absolutePath2,
        diffSet,
        initialStatistics,
        compareInfo
      );
      const result: IStatisticsResults =
        statisticsService.completeStatistics(extOptions);
      result.diffSet = diffSet;
      return result;
    }

    const rootEntry1 = await EntryService.buildEntry(
      absolutePath1,
      path1,
      pathUtils.basename(absolutePath1),
      EntryOrigin.LEFT,
      extOptions
    );
    const rootEntry2 = await EntryService.buildEntry(
      absolutePath2,
      path2,
      pathUtils.basename(absolutePath2),
      EntryOrigin.RIGHT,
      extOptions
    );

    await EntryService.compareDirEntriesAsync(
      rootEntry1,
      rootEntry2,
      0,
      ROOT_PATH,
      extOptions,
      initialStatistics,
      asyncDiffSet,
      SymlinkService.initSymlinkCache()
    );
    const result_2: IStatisticsResults =
      statisticsService.completeStatistics(extOptions);
    if (!extOptions.noDiffSet) {
      const diffSet_1: DiffSet = [];
      this.#rebuildAsyncDiffSet(result_2, asyncDiffSet, diffSet_1);
      result_2.diffSet = diffSet_1;
    }
    return result_2;
  }

  static #rebuildAsyncDiffSet(
    statistics: IStatistics,
    asyncDiffSet: AsyncDiffSet,
    diffSet: DiffSet
  ): void {
    asyncDiffSet.forEach((rawDiff) => {
      if (!Array.isArray(rawDiff)) {
        diffSet.push(rawDiff);
      } else {
        this.#rebuildAsyncDiffSet(statistics, rawDiff, diffSet);
      }
    });
  }

  static #prepareOptions(
    compareInfo: CompareInfo,
    options?: IOptions
  ): IExtraOptions {
    options = options || {};
    const clonedOptions: IOptions = JSON.parse(JSON.stringify(options));

    clonedOptions.resultBuilder = options.resultBuilder;
    clonedOptions.compareFileSync = options.compareFileSync;
    clonedOptions.compareFileAsync = options.compareFileAsync;
    clonedOptions.compareNameHandler = options.compareNameHandler;
    clonedOptions.filterHandler = options.filterHandler;

    if (!clonedOptions.resultBuilder) {
      clonedOptions.resultBuilder = this
        .#defaultResultBuilderCallback as ResultBuilder;
    }
    if (!clonedOptions.compareFileAsync) {
      clonedOptions.compareFileAsync = ComparisonService.CompareFileAsync;
    }
    if (!clonedOptions.compareNameHandler) {
      const isFileBasedCompare = compareInfo.modeMore === CompareMode.FILES;
      clonedOptions.compareNameHandler = isFileBasedCompare
        ? ComparisonService.fileBasedNameCompare
        : ComparisonService.defaultNameCompare;
    }
    if (!clonedOptions.filterHandler) {
      clonedOptions.filterHandler =
        FilterService.defaultFilterHandler as FilterHandler;
    }

    clonedOptions.dateTolerance = clonedOptions.dateTolerance || 1000;
    clonedOptions.dateTolerance = Number(clonedOptions.dateTolerance);

    if (isNaN(clonedOptions.dateTolerance)) {
      throw new Error('Date tolerance is not a number');
    }

    return clonedOptions as IExtraOptions;
  }

  static #defaultResultBuilderCallback(
    entry1: IEntry,
    entry2: IEntry,
    state: DifferenceState,
    level: number,
    relativePath: string,
    options: IOptions,
    statistics: IStatistics,
    diffSet: DiffSet,
    diffReason: DiffReason,
    permissionDeniedState: PermissionDeniedState
  ): void {
    if (options.noDiffSet) {
      return;
    }

    diffSet.push({
      path1: entry1 ? pathUtils.dirname(entry1.path) : undefined,
      path2: entry2 ? pathUtils.dirname(entry2.path) : undefined,
      relativePath: relativePath,
      name1: entry1 ? entry1.name : undefined,
      name2: entry2 ? entry2.name : undefined,
      state: state,
      permissionDeniedState,
      type1: EntryService.getType(entry1),
      type2: EntryService.getType(entry2),
      level: level,
      size1: entry1 ? entry1.stat.size : undefined,
      size2: entry2 ? entry2.stat.size : undefined,
      date1: entry1 ? entry1.stat.mtime : undefined,
      date2: entry2 ? entry2.stat.mtime : undefined,
      diffReason: diffReason
    });
  }
}
