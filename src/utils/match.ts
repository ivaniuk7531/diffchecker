import { minimatch } from 'minimatch';

export const match = (path: string, patterns: string[]): boolean => {
  for (let i = 0; i < patterns.length; i++) {
    const pat = patterns[i];
    if (minimatch(path, pat, { dot: true, matchBase: true })) {
      return true;
    }
  }
  return false;
};
