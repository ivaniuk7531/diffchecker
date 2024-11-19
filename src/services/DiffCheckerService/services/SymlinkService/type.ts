export type SymlinkCache = {
  dir1: RootDirSymlinkCache;
  dir2: RootDirSymlinkCache;
};

export type RootDirSymlinkCache = {
  [key: SymlinkPath]: boolean;
};

export type SymlinkPath = string;
