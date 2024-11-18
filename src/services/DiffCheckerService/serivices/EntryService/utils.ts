import fs, { Stats } from 'fs';
import {
  AsyncDiffSet,
  DifferenceType,
  IEntry,
  FileEquality,
  FileEqualityAsync,
  FileEqualityPromise,
  DiffReason
} from './types.js';
import { IExtraOptions } from '../../types.js';

import { createHash } from 'crypto';

export function hasPermissionDenied(
  absolutePath: string,
  isFile: boolean,
  options: IExtraOptions
): boolean {
  if (isFile && !options.compareContent) {
    return false;
  }
  try {
    fs.accessSync(absolutePath, fs.constants.R_OK);
    return false;
  } catch {
    return true;
  }
}

type CombinedStats = {
  stat: Stats;
  lstat: Stats;
  isBrokenLink: boolean;
};

export function getStatIgnoreBrokenLink(absolutePath: string): CombinedStats {
  const lstat = fs.lstatSync(absolutePath);
  try {
    return {
      stat: fs.statSync(absolutePath),
      lstat: lstat,
      isBrokenLink: false
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return {
        stat: lstat,
        lstat: lstat,
        isBrokenLink: true
      };
    }
    throw error;
  }
}

export function filterEntry(
  entry: IEntry,
  relativePath: string,
  options: IExtraOptions
): boolean {
  if (entry.isSymlink && options.skipSymlinks) {
    return false;
  }

  if (
    options.skipEmptyDirs &&
    entry.stat.isDirectory() &&
    isEmptyDir(entry.absolutePath)
  ) {
    return false;
  }

  return options.filterHandler(entry, relativePath, options);
}

function isEmptyDir(path: string): boolean {
  return fs.readdirSync(path).length === 0;
}

export function isFileEqualAsync(
  entry1: IEntry,
  entry2: IEntry,
  type: DifferenceType,
  asyncDiffSet: AsyncDiffSet,
  options: IExtraOptions
): FileEqualityPromise {
  if (options.compareSymlink && !isSymlinkEqual(entry1, entry2)) {
    return {
      isSync: true,
      isSame: false,
      diffReason: DiffReason.DIFFERENT_SYMLINK
    };
  }

  if (
    options.compareDate &&
    !isDateEqual(entry1.stat.mtime, entry2.stat.mtime, options.dateTolerance)
  ) {
    return {
      isSync: true,
      isSame: false,
      diffReason: DiffReason.DIFFERENT_DATE
    };
  }

  if (
    options.compareFileHash &&
    !isFileHashEqual(entry1.fileHash, entry2.fileHash)
  ) {
    return {
      isSync: true,
      isSame: false,
      diffReason: DiffReason.DIFFERENT_FILE_HASH
    };
  }

  if (options.compareSize && entry1.stat.size !== entry2.stat.size) {
    return {
      isSync: true,
      isSame: false,
      diffReason: DiffReason.DIFFERENT_SIZE
    };
  }

  if (options.compareContent) {
    let subDiffSet: AsyncDiffSet;
    if (!options.noDiffSet) {
      subDiffSet = [];
      asyncDiffSet.push(subDiffSet);
    }
    const samePromise: Promise<FileEqualityAsync> = options
      .compareFileAsync(
        entry1.absolutePath,
        entry1.stat,
        entry2.absolutePath,
        entry2.stat,
        options
      )
      .then((comparisonResult) => {
        if (typeof comparisonResult !== 'boolean') {
          return {
            hasErrors: true,
            error: comparisonResult
          } as FileEqualityAsync;
        }

        const isSame = comparisonResult;
        const diffReason: DiffReason | undefined = isSame
          ? undefined
          : DiffReason.DIFFERENT_CONTENT;

        return {
          hasErrors: false,
          isSame,
          diffReason,
          context: {
            entry1,
            entry2,
            type1: type,
            type2: type,
            asyncDiffSet: subDiffSet
          }
        } as FileEqualityAsync;
      })
      .catch((error) => ({
        hasErrors: true,
        error
      }));

    return { isSync: false, fileEqualityAsyncPromise: samePromise };
  }

  return { isSync: true, isSame: true };
}

function isDateEqual(date1: Date, date2: Date, tolerance: number): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) <= tolerance;
}

export function isDirectoryEqual(
  entry1: IEntry,
  entry2: IEntry,
  options: IExtraOptions
): FileEquality {
  if (options.compareSymlink && !isSymlinkEqual(entry1, entry2)) {
    return { isSame: false, diffReason: DiffReason.DIFFERENT_SYMLINK };
  }
  return { isSame: true, diffReason: undefined };
}

export function isBrokenLinkEqual(): FileEquality {
  return { isSame: false, diffReason: DiffReason.BROKEN_LINK }; // broken links are never considered equal
}

export function isSymlinkEqual(entry1: IEntry, entry2: IEntry): boolean {
  if (!entry1.isSymlink && !entry2.isSymlink) {
    return true;
  }
  return (
    entry1.isSymlink &&
    entry2.isSymlink &&
    hasIdenticalLink(entry1.absolutePath, entry2.absolutePath)
  );
}

export function hasIdenticalLink(path1: string, path2: string): boolean {
  return fs.readlinkSync(path1) === fs.readlinkSync(path2);
}

export const createHashFromFile = async (filePath: string): Promise<string> => {
  const hash = createHash('sha1');
  const stream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

export function isFileHashEqual(
  fileHash1: string | null,
  fileHash2: string | null
): boolean {
  if (!fileHash1 || !fileHash2) {
    return false;
  }

  return fileHash1 === fileHash2;
}
