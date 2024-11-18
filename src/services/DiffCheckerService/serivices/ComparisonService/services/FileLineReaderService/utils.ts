import { IFileLineReaderServiceResult } from './types.js';

export function removeLastLine(lines: string[]): IFileLineReaderServiceResult {
  const lastLine = lines[lines.length - 1];
  return {
    lines: lines.slice(0, lines.length - 1),
    rest: lastLine,
    reachedEof: false
  };
}
