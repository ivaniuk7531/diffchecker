import pathUtils from 'path';
import { minimatch } from 'minimatch';
import { IEntry } from '../EntryService/index.js';
import { IExtraOptions } from '../../types.js';

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
      !this.#match(path, options.includeFilter)
    ) {
      return false;
    }

    if (options.excludeFilter && this.#match(path, options.excludeFilter)) {
      return false;
    }

    return true;
  };

  static #match(path: string, patterns: string[]): boolean {
    for (let i = 0; i < patterns.length; i++) {
      const pat = patterns[i];
      if (minimatch(path, pat, { dot: true, matchBase: true })) {
        return true;
      }
    }
    return false;
  }
}
