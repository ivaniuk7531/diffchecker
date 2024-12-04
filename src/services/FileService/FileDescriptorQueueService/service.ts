import fs, { NoParamCallback } from 'fs';
import { QueueService } from '../../QueueService/index.js';
import { Job, OpenFileCallback, OpenFileFlags } from './types.js';

export class FileDescriptorQueueService {
  private activeCount = 0;
  private pendingJobs = new QueueService<Job>();
  constructor(private maxFilesNo: number) {}

  open(path: string, flags: OpenFileFlags, callback: OpenFileCallback): void {
    this.pendingJobs.enqueue({
      path: path,
      flags: flags,
      callback: callback
    });
    this.process();
  }

  process(): void {
    if (
      this.pendingJobs.getLength() > 0 &&
      this.activeCount < this.maxFilesNo
    ) {
      const job = this.pendingJobs.dequeue() as Job;
      this.activeCount++;
      fs.open(job.path, job.flags, job.callback);
    }
  }

  close(fd: number, callback: NoParamCallback): void {
    this.activeCount--;
    fs.close(fd, callback);
    this.process();
  }

  openPromise(path: string, flags: OpenFileFlags): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.open(path, flags, (err, fd) => {
        if (err) {
          reject(err);
        } else {
          resolve(fd);
        }
      });
    });
  }

  closePromise(fd: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.close(fd, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
