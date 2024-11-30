import SFTPClient from 'ssh2-sftp-client';
import { ISFTPServiceOptions } from './type.js';
import { FileService } from '../FileService/index.js';
import { SFTP_DEBUG } from '../../constants/env.js';

export class SFTPService {
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

  async fastDownloadDirectoryRecursively(localDir: string, remoteDir: string) {
    try {
      const files = await this.client.list(remoteDir);

      for (const file of files) {
        const { name, type } = file;

        const isFile = type === '-';
        const isDirectory = type === 'd';

        const remoteFilePath = FileService.join(remoteDir, name);
        const localFilePath = FileService.join(localDir, name);
        const isValid = this.#filter(isFile, remoteFilePath);

        if (!isValid) {
          continue;
        }

        if (!FileService.existsSync(localDir)) {
          FileService.mkdirSync(localDir, { recursive: true });
        }

        if (isDirectory) {
          await this.fastDownloadDirectoryRecursively(
            localFilePath,
            remoteFilePath
          );
        }

        if (isFile) {
          await this.client.fastGet(remoteFilePath, localFilePath);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error processing ${remoteDir}:`, error.message);
      }
    }
  }

  async fastUploadDirectoryRecursively(localDir: string, remoteDir: string) {
    try {
      const dirContent = FileService.readdirSync(localDir);

      // await this.client.ensureDir(remoteDir);

      for (const content of dirContent) {
        const fullPath = FileService.join(localDir, content);
        const stats = FileService.statSync(fullPath);

        if (stats.isDirectory()) {
          await this.fastUploadDirectoryRecursively(fullPath, content);
        } else if (stats.isFile()) {
          await this.client.fastPut(fullPath, content);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error uploading directory: ${err.message}`);
      }
    }
  }

  #filter(isFile: boolean, path: string) {
    if (
      isFile &&
      this?.options?.includeFilter &&
      !FileService.match(path, this?.options?.includeFilter)
    ) {
      return false;
    }

    if (
      this?.options?.excludeFilter &&
      FileService.match(path, this?.options?.excludeFilter)
    ) {
      return false;
    }

    return true;
  }
}
