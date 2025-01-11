import { Client } from 'basic-ftp';
import { IFTPServiceOptions } from './types.js';
import { FileService } from '../../../FileService/index.js';
import {
  DiffReason,
  IStatisticsResults
} from '../../../DiffCheckerService/index.js';
import { DifferenceType } from '../../../DiffCheckerService/services/EntryService/index.js';
import fs from 'fs';
import path from 'node:path';
import { REMOTE_ENTRY_POINT } from '../../../../constants/env.js';
import { IConnectionClient } from '../../types.js';

export class FTPService implements IConnectionClient {
  private client: Client;
  private readonly host: string;
  private readonly username: string;
  private readonly password: string;
  private readonly port: number;
  private readonly options?: IFTPServiceOptions;

  constructor(
    host: string,
    username: string,
    password: string,
    port: number,
    options: IFTPServiceOptions = {}
  ) {
    this.client = new Client();
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
    this.options = options;
  }

  async connect() {
    try {
      this.client.ftp.verbose = !!this.options?.debug;
      await this.client.access({
        host: this.host,
        user: this.username,
        password: this.password,
        port: this.port,
        secure: true
      });
    } catch (error) {
      console.error('Error connecting to SFTP server:', error);
      throw error;
    }
  }

  async closeConnection() {
    this.client.close();
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

      while (stack.length > 0) {
        const { local, remote } = stack.pop()!;

        const files = await this.client.list(remote);

        if (!fs.existsSync(local)) {
          fs.mkdirSync(local, { recursive: true });
        }

        for (const file of files) {
          const { name, isFile, isDirectory } = file;
          const remoteFilePath = path
            .normalize(path.join(remote, name))
            .replace(/\\/g, '/');
          const localFilePath = path.join(local, name);

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

          if (isFile) {
            console.log('Downloading file:', remoteFilePath);

            await this.client.downloadTo(localFilePath, remoteFilePath);
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error downloading:`, error);
      }
      throw error;
    }
  }

  async uploadFiles(data: IStatisticsResults): Promise<string[] | undefined> {
    try {
      if (!data?.diffSet || data?.diffSet.length === 0) {
        return;
      }

      const uploadedFiles: string[] = [];

      for (const diff of data.diffSet) {
        const isMissingOnServer =
          diff.type1 === DifferenceType.MISSING &&
          diff.type2 === DifferenceType.FILE;
        const isDifferentContent =
          diff.diffReason === DiffReason.DIFFERENT_CONTENT;

        if (isDifferentContent || isMissingOnServer) {
          const localFilePath = path.normalize(`${diff.path2}/${diff.name2}`);
          const remoteDirPath = path
            .normalize(`${REMOTE_ENTRY_POINT}${diff.relativePath}`)
            .replace(/\\/g, '/');
          const remoteFilePath = path
            .normalize(`${remoteDirPath}/${diff.name2}`)
            .replace(/\\/g, '/');

          await this.client.ensureDir(remoteDirPath);

          console.log('Uploading file:', remoteFilePath);

          await this.client.uploadFrom(localFilePath, `${diff.name2}`);

          uploadedFiles.push(remoteFilePath);
        }
      }

      return uploadedFiles;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error upload files:', error);
      }
    }
  }
}
