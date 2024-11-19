import { IFileLineReaderServiceResult } from './types.js';
import { FileSystemService } from '../../../FileSystemService/index.js';
import { removeLastLine } from './utils.js';

const LINE_TOKENIZER_REGEXP = /[^\n]+\n?|\n/g;

export class FileLineReaderService {
  static readLines(
    buf: Buffer,
    size: number,
    allocatedBufferSize: number,
    rest: string,
    restLines: string[]
  ): IFileLineReaderServiceResult {
    if (size === 0 && rest.length === 0) {
      return { lines: [...restLines], rest: '', reachedEof: true };
    }
    if (size === 0) {
      return { lines: [...restLines, rest], rest: '', reachedEof: true };
    }

    const fileContent = rest + buf.toString('utf8', 0, size);
    const lines = [
      ...restLines,
      ...(fileContent.match(LINE_TOKENIZER_REGEXP) as string[])
    ];

    const reachedEof = size < allocatedBufferSize;
    if (reachedEof) {
      return {
        lines,
        rest: '',
        reachedEof: true
      };
    }

    return removeLastLine(lines);
  }

  static async readLineBatchAsync(
    fd: number,
    buf: Buffer,
    bufferSize: number,
    rest: string,
    restLines: string[]
  ): Promise<IFileLineReaderServiceResult> {
    const size = await FileSystemService.read(fd, buf, 0, bufferSize, null);

    return FileLineReaderService.readLines(
      buf,
      size,
      bufferSize,
      rest,
      restLines
    );
  }
}
