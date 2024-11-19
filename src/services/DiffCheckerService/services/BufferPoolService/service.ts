import { IBufferPair } from './types.js';

export class BufferPoolService {
  private readonly bufferPool: IBufferPair[] = [];

  constructor(
    private readonly bufSize: number,
    private readonly bufNo: number
  ) {
    for (let i = 0; i < this.bufNo; i++) {
      this.bufferPool.push({
        buf1: Buffer.alloc(this.bufSize),
        buf2: Buffer.alloc(this.bufSize),
        busy: false
      });
    }
  }

  public allocateBuffers(): IBufferPair {
    for (let j = 0; j < this.bufNo; j++) {
      const bufferPair = this.bufferPool[j];
      if (!bufferPair.busy) {
        bufferPair.busy = true;
        return bufferPair;
      }
    }
    throw new Error('Async buffer limit reached');
  }

  public freeBuffers(bufferPair: IBufferPair): void {
    bufferPair.busy = false;
  }
}
