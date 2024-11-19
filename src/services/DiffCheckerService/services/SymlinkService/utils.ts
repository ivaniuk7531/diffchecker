import { RootDirSymlinkCache } from './type.js';

export function shallowClone(obj: RootDirSymlinkCache): RootDirSymlinkCache {
  const cloned: Record<string, boolean> = {};
  Object.keys(obj).forEach((key) => {
    cloned[key] = obj[key];
  });
  return cloned;
}
