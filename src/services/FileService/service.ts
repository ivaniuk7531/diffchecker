import fs, {
  Dirent,
  MakeDirectoryOptions,
  Mode,
  ObjectEncodingOptions,
  Stats
} from 'fs';
import { PathLike, RmOptions } from 'node:fs';
import { minimatch } from 'minimatch';
import { FileDescriptorQueueService } from '../QueueService/services/FileDescriptorQueueService/index.js';
import { BytesRead, FileServiceReadLinesResult } from './types.js';
import { LINE_TOKENIZER_REGEXP } from './constants.js';
import path from 'node:path';

export class FileService {
  static existsSync(path: PathLike): boolean {
    return fs.existsSync(path);
  }

  static statSync(path: PathLike): Stats {
    return fs.statSync(path);
  }

  static readdirSync(
    path: PathLike,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
      | null
  ): string[] {
    return fs.readdirSync(path, options);
  }

  static join(...paths: string[]): string {
    return path.join(...paths);
  }

  static mkdirSync(
    path: PathLike,
    options?:
      | Mode
      | (MakeDirectoryOptions & {
          recursive?: boolean | undefined;
        })
      | null
  ): void {
    fs.mkdirSync(path, options);
  }

  static rmSync(path: PathLike, options?: RmOptions): void {
    fs.rmSync(path, options);
  }

  static match = (path: string, pattern: string): boolean => {
    const patternArray = pattern.split(',');
    for (let i = 0; i < patternArray.length; i++) {
      const pat = patternArray[i];
      if (minimatch(path, pat, { dot: true, matchBase: true })) {
        return true;
      }
    }
    return false;
  };

  static async closeFilesAsync(
    fd1: number | undefined,
    fd2: number | undefined,
    fdQueue: FileDescriptorQueueService
  ): Promise<void> {
    if (fd1 && fd2) {
      await fdQueue.closePromise(fd1);
      return await fdQueue.closePromise(fd2);
    }
    if (fd1) {
      return fdQueue.closePromise(fd1);
    }
    if (fd2) {
      return fdQueue.closePromise(fd2);
    }
    return Promise.resolve();
  }

  static async readdir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  static async read(
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ): Promise<BytesRead> {
    return new Promise((resolve, reject) => {
      fs.read(fd, buffer, offset, length, position, (err, bytesRead) => {
        if (err) {
          reject(err);
        } else {
          resolve(bytesRead);
        }
      });
    });
  }

  static readLines(
    buf: Buffer,
    size: number,
    allocatedBufferSize: number,
    rest: string,
    restLines: string[]
  ): FileServiceReadLinesResult {
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

    return this.#removeLastLine(lines);
  }

  static async readLineBatchAsync(
    fd: number,
    buf: Buffer,
    bufferSize: number,
    rest: string,
    restLines: string[]
  ): Promise<FileServiceReadLinesResult> {
    const size = await this.read(fd, buf, 0, bufferSize, null);

    return this.readLines(buf, size, bufferSize, rest, restLines);
  }

  static #removeLastLine(lines: string[]): FileServiceReadLinesResult {
    const lastLine = lines[lines.length - 1];
    return {
      lines: lines.slice(0, lines.length - 1),
      rest: lastLine,
      reachedEof: false
    };
  }
}
