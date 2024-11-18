import fs from 'fs';
import { RealPathOptions } from './types.js';

export function realPath(
  path: string,
  options?: RealPathOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.realpath(path, options, (err, resolvedPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(resolvedPath);
      }
    });
  });
}
