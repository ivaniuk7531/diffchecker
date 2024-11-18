import { FileDescriptorQueueService } from '../FileDescriptorQueueService/index.js';

export class FileService {
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
}
