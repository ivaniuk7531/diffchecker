import { MAX_UNUSED_ARRAY_SIZE } from './constants.js';

export class QueueService<T> {
  private queue: T[] = [];
  private offset = 0;

  public getLength(): number {
    return this.queue.length - this.offset;
  }

  public enqueue(item: T): void {
    this.queue.push(item);
  }

  public dequeue(): T | undefined {
    if (this.queue.length === 0) {
      return undefined;
    }

    const item = this.queue[this.offset];

    if (++this.offset > MAX_UNUSED_ARRAY_SIZE) {
      this.queue = this.queue.slice(this.offset);
      this.offset = 0;
    }

    return item;
  }
}
