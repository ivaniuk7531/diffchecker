import SFTPClient from 'ssh2-sftp-client';
import { ISFTPServiceOptions } from './types.js';
import { FileService } from '../../../FileService/index.js';
import { REMOTE_ENTRY_POINT, SFTP_DEBUG } from '../../../../constants/env.js';
import {
  DiffReason,
  IStatisticsResults
} from '../../../DiffCheckerService/index.js';
import { DifferenceType } from '../../../DiffCheckerService/services/EntryService/index.js';
import pLimit from 'p-limit';
import { DOWNLOAD_CONCURRENCY, UPLOAD_CONCURRENCY } from './constants.js';
import fs from 'fs';
import path from 'node:path';
import { IConnectionClient } from '../../types.js';

export class SFTPService implements IConnectionClient {
  private client: SFTPClient;
  private readonly host: string;
  private readonly username: string;
  private readonly password: string;
  private readonly port: number;
  private readonly options?: ISFTPServiceOptions;

  constructor(
    host: string,
    username: string,
    password: string,
    port: number,
    options: ISFTPServiceOptions = {}
  ) {
    this.client = new SFTPClient();
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
    this.options = options;
  }

  async connect() {
    try {
      await this.client.connect({
        host: this.host,
        username: this.username,
        password: this.password,
        port: this.port,
        debug: SFTP_DEBUG
          ? (msg) => {
              console.error(msg);
            }
          : undefined
      });
    } catch (error) {
      console.error('Error connecting to SFTP server:', error);
      throw error;
    }
  }

  async closeConnection() {
    await this.client.end();
  }

  async downloadFiles(localDir: string, remoteDir: string) {
    try {
      fs.rmSync(localDir, {
        recursive: true,
        force: true
      });

      const stack: { local: string; remote: string }[] = [
        { local: localDir, remote: remoteDir }
      ];

      const limit = pLimit(DOWNLOAD_CONCURRENCY);

      while (stack.length > 0) {
        const { local, remote } = stack.pop()!;

        const files = await this.client.list(remote);

        if (!fs.existsSync(local)) {
          fs.mkdirSync(local, { recursive: true });
        }

        const downloadTasks: Promise<void>[] = [];

        for (const file of files) {
          const { name, type } = file;

          const remoteFilePath = path.join(remote, name);
          const localFilePath = path.join(local, name);

          const isFile = type === '-';
          const isDirectory = type === 'd';
          const isValid = FileService.shouldIncludeFile(
            isFile,
            remoteFilePath,
            this.options?.includeFilter,
            this.options?.excludeFilter
          );

          if (!isValid) {
            continue;
          }

          if (isDirectory) {
            stack.push({ local: localFilePath, remote: remoteFilePath });
          }
          console.log('Downloading file:', remoteFilePath);

          if (isFile) {
            downloadTasks.push(
              limit(async () => {
                await this.client.get(remoteFilePath, localFilePath);
              })
            );
          }
        }

        await Promise.all(downloadTasks);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error downloading:`, error.message);
      }

      throw error;
    }
  }

  async uploadFiles(data: IStatisticsResults): Promise<string[] | undefined> {
    try {
      if (!data?.diffSet || data?.diffSet.length === 0) {
        return;
      }

      const uploadLimit = pLimit(UPLOAD_CONCURRENCY);

      const uploadTasks: Promise<void>[] = [];

      const uploadedFiles: string[] = [];

      for (const diff of data.diffSet) {
        const isMissingOnServer =
          diff.type1 === DifferenceType.MISSING &&
          diff.type2 === DifferenceType.FILE;
        const isDifferentContent =
          diff.diffReason === DiffReason.DIFFERENT_CONTENT;

        if (isDifferentContent || isMissingOnServer) {
          const localFilePath = path.normalize(`${diff.path2}/${diff.name2}`);
          const remoteDirPath = path.normalize(
            `${REMOTE_ENTRY_POINT}${diff.relativePath}`
          );
          const remoteFilePath = path.normalize(
            `${remoteDirPath}/${diff.name2}`
          );

          const isDirExists = await this.client.exists(remoteDirPath);

          if (!isDirExists) {
            await this.client.mkdir(remoteDirPath, true);
          }
          console.log('Uploading file:', remoteFilePath);

          uploadTasks.push(
            uploadLimit(async () => {
              await this.client.put(localFilePath, remoteFilePath);

              uploadedFiles.push(remoteFilePath);
            })
          );
        }
      }

      await Promise.all(uploadTasks);

      return uploadedFiles;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error upload files: ${err.message}`);
      }
    }
  }
}
