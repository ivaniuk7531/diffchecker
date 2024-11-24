import pathUtils from 'path';
import { IEntry } from '../EntryService/index.js';
import { IExtraOptions } from '../../types.js';
import { match } from '../../../../utils/match.js';

export class FilterService {
  static defaultFilterHandler = (
    entry: IEntry,
    relativePath: string,
    options: IExtraOptions
  ): boolean => {
    const path = pathUtils.join(relativePath, entry.name);

    if (
      entry.stat.isFile() &&
      options.includeFilter &&
      !match(path, options.includeFilter)
    ) {
      return false;
    }

    if (options.excludeFilter && match(path, options.excludeFilter)) {
      return false;
    }

    return true;
  };
}
