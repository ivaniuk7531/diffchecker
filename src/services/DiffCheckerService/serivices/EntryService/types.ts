import fs from 'fs';
import { PermissionDeniedState } from '../PermissionService/index.js';

export enum EntryOrigin {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum DifferenceState {
  EQUAL = 'EQUAL',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  DISTINCT = 'DISTINCT'
}

export enum DiffReason {
  DIFFERENT_SIZE = 'DIFFERENT_SIZE',
  DIFFERENT_DATE = 'DIFFERENT_DATE',
  DIFFERENT_FILE_HASH = 'DIFFERENT_FILE_HASH',
  DIFFERENT_CONTENT = 'DIFFERENT_CONTENT',
  BROKEN_LINK = 'BROKEN_LINK',
  DIFFERENT_SYMLINK = 'DIFFERENT_SYMLINK',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export enum HashAlgorithms {
  md5 = 'md5',
  sha1 = 'sha1',
  sha256 = 'sha256',
  sha512 = 'sha512'
}

export enum DifferenceType {
  MISSING = 'MISSING',
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
  BROKEN_LINK = 'BROKEN_LINK'
}

export interface IEntry {
  name: string;
  absolutePath: string;
  path: string;
  fileHash: null | string;
  origin: EntryOrigin;
  stat: fs.Stats;
  lstat: fs.Stats;
  isDirectory: boolean;
  isSymlink: boolean;
  isBrokenLink: boolean;
  isPermissionDenied: boolean;
}

export type OptionalEntry = IEntry | undefined;

export type FileEquality = {
  isSame: boolean;

  diffReason?: DiffReason;
};

export type FileEqualityPromise =
  | FileEqualityPromiseSync
  | FileEqualityPromiseAsync;

export type FileEqualityAsync =
  | FileEqualityAsyncSuccess
  | FileEqualityAsyncError;

type FileEqualityPromiseSync = {
  isSync: true;
  isSame: boolean;
  diffReason?: DiffReason;
};

type FileEqualityPromiseAsync = {
  isSync: false;
  fileEqualityAsyncPromise: Promise<FileEqualityAsync>;
};

type FileEqualityAsyncSuccess = {
  hasErrors: false;
  isSame: boolean;
  diffReason: DiffReason;
  context: FileEqualityAsyncContext;
};

type FileEqualityAsyncError = {
  hasErrors: true;
  error: unknown;
};

type FileEqualityAsyncContext = {
  entry1: IEntry;
  entry2: IEntry;
  asyncDiffSet: AsyncDiffSet;
  type1: DifferenceType;
  type2: DifferenceType;
};

export type DiffSet = Array<IDifference>;

export type OptionalDiffSet = DiffSet | undefined;

export type AsyncDiffSet = Array<IDifference | AsyncDiffSet>;

export interface IDifference {
  [key: string]: any;

  path1?: string;

  path2?: string;

  relativePath: string;

  name1?: string;

  name2?: string;

  state: DifferenceState;

  permissionDeniedState: PermissionDeniedState;

  type1: DifferenceType;

  type2: DifferenceType;

  size1?: number;

  size2?: number;

  date1?: Date;

  date2?: Date;

  level: number;

  diffReason: DiffReason;
}
