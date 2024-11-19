import fs from 'fs';
import { OptionalEntry } from '../EntryService/index.js';
import { RootDirSymlinkCache, SymlinkCache } from './type.js';
import { shallowClone } from './utils.js';

export class SymlinkService {
  static detectLoop(
    entry: OptionalEntry,
    symlinkCache: RootDirSymlinkCache
  ): boolean {
    if (entry?.isSymlink) {
      const realPath = fs.realpathSync(entry.absolutePath);
      if (symlinkCache[realPath]) {
        return true;
      }
    }
    return false;
  }

  static initSymlinkCache(): SymlinkCache {
    return {
      dir1: {},
      dir2: {}
    };
  }

  static updateSymlinkCache(
    symlinkCache: SymlinkCache,
    rootEntry1: OptionalEntry,
    rootEntry2: OptionalEntry,
    loopDetected1: boolean,
    loopDetected2: boolean
  ): void {
    if (rootEntry1 && !loopDetected1) {
      const symlinkCachePath1 = rootEntry1.isSymlink
        ? fs.realpathSync(rootEntry1.absolutePath)
        : rootEntry1.absolutePath;
      symlinkCache.dir1[symlinkCachePath1] = true;
    }

    if (rootEntry2 && !loopDetected2) {
      const symlinkCachePath2 = rootEntry2.isSymlink
        ? fs.realpathSync(rootEntry2.absolutePath)
        : rootEntry2.absolutePath;
      symlinkCache.dir2[symlinkCachePath2] = true;
    }
  }

  static cloneSymlinkCache(symlinkCache: SymlinkCache): SymlinkCache {
    return {
      dir1: shallowClone(symlinkCache.dir1),
      dir2: shallowClone(symlinkCache.dir2)
    };
  }
}
