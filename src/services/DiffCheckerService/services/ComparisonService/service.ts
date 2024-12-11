import fs from 'fs';
import { ComparisonServiceContext } from './context.js';
import { ICompareLineBatchResult, NameCompareResult } from './types.js';
import { compareLines, emptyRestLines, strcmp } from './utils.js';
import { BufferPoolService } from '../BufferPoolService/index.js';
import { FileDescriptorQueueService } from '../../../FileService/services/FileDescriptorQueueService/index.js';
import { BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE } from './constants.js';
import { IDiffCheckerServiceOptions } from '../../types.js';
import {
  FileService,
  FileServiceReadLinesResult
} from '../../../FileService/index.js';

const fdQueue = new FileDescriptorQueueService(MAX_CONCURRENT_FILE_COMPARE * 2);
const bufferPool = new BufferPoolService(BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE); // fdQueue guarantees there will be no more than MAX_CONCURRENT_FILE_COMPARE async processes accessing the buffers concurrently

export class ComparisonService {
  static async CompareFileAsync(
    path1: string,
    stat1: fs.Stats,
    path2: string,
    stat2: fs.Stats,
    options: IDiffCheckerServiceOptions
  ): Promise<boolean> {
    const bufferSize = Math.min(
      BUF_SIZE,
      options.lineBasedHandlerBufferSize ?? Number.MAX_VALUE
    );
    let context: ComparisonServiceContext | undefined;

    try {
      const fileDescriptors = await Promise.all([
        fdQueue.openPromise(path1, 'r'),
        fdQueue.openPromise(path2, 'r')
      ]);

      context = new ComparisonServiceContext(
        fileDescriptors[0],
        fileDescriptors[1],
        bufferPool.allocateBuffers()
      );

      while (true) {
        const lineBatch1 = await FileService.readLineBatchAsync(
          context.fd1,
          context.buffer.buf1,
          bufferSize,
          context.rest.rest1,
          context.restLines.restLines1
        );

        const lineBatch2 = await FileService.readLineBatchAsync(
          context.fd2,
          context.buffer.buf2,
          bufferSize,
          context.rest.rest2,
          context.restLines.restLines2
        );

        context.rest.rest1 = lineBatch1.rest;
        context.rest.rest2 = lineBatch2.rest;

        const compareResult = ComparisonService.compareLineBatches(
          lineBatch1,
          lineBatch2,
          options
        );
        if (!compareResult.batchIsEqual) {
          return false;
        }
        if (compareResult.reachedEof) {
          return compareResult.batchIsEqual;
        }

        context.restLines.restLines1 = compareResult.restLines.restLines1;
        context.restLines.restLines2 = compareResult.restLines.restLines2;
      }
    } finally {
      if (context) {
        bufferPool.freeBuffers(context.buffer);
        await FileService.closeFilesAsync(context.fd1, context.fd2, fdQueue);
      }
    }
  }

  static compareLineBatches(
    lineBatch1: FileServiceReadLinesResult,
    lineBatch2: FileServiceReadLinesResult,
    options: IDiffCheckerServiceOptions
  ): ICompareLineBatchResult {
    const compareResult = compareLines(
      lineBatch1.lines,
      lineBatch2.lines,
      options
    );
    if (!compareResult.isEqual) {
      return {
        batchIsEqual: false,
        reachedEof: false,
        restLines: emptyRestLines()
      };
    }

    const reachedEof = lineBatch1.reachedEof && lineBatch2.reachedEof;
    const hasMoreLinesToProcess =
      compareResult.restLines1.length > 0 ||
      compareResult.restLines2.length > 0;
    if (reachedEof && hasMoreLinesToProcess) {
      return {
        batchIsEqual: false,
        reachedEof: true,
        restLines: emptyRestLines()
      };
    }

    if (reachedEof) {
      return {
        batchIsEqual: true,
        reachedEof: true,
        restLines: emptyRestLines()
      };
    }

    return {
      batchIsEqual: true,
      reachedEof: false,
      restLines: {
        restLines1: compareResult.restLines1,
        restLines2: compareResult.restLines2
      }
    };
  }

  static defaultNameCompare = (
    name1: string,
    name2: string
  ): NameCompareResult => {
    name1 = name1.toLowerCase();
    name2 = name2.toLowerCase();
    return strcmp(name1, name2);
  };

  static fileBasedNameCompare(): NameCompareResult {
    return 0;
  }
}
