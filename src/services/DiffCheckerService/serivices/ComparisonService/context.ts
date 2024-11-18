import { IRestLines, IRestPair } from './types.js';
import { IBufferPair } from '../BufferPoolService/index.js';

export class ComparisonServiceContext {
  public fd1: number;

  public fd2: number;

  public buffer: IBufferPair;

  public rest: IRestPair = { rest1: '', rest2: '' };

  public restLines: IRestLines = { restLines1: [], restLines2: [] };

  constructor(fd1: number, fd2: number, bufferPair: IBufferPair) {
    this.fd1 = fd1;
    this.fd2 = fd2;
    this.buffer = bufferPair;
  }
}
