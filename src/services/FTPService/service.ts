import { Client } from 'basic-ftp';
import fs from 'fs';
import path from 'node:path';
import { IFTPServiceOptions } from './type.js';
import { match } from '../../utils/match.js';

export class FTPService {
  private client: Client;
  private readonly host: string;
  private readonly user: string;
  private readonly password: string;
  private readonly secure: boolean;
  private readonly options?: IFTPServiceOptions;

  constructor(
    host: string,
    user: string,
    password: string,
    secure: boolean = false,
    verbose: boolean = false,
    options: IFTPServiceOptions = {}
  ) {
    this.client = new Client();
    this.client.ftp.verbose = verbose;
    this.host = host;
    this.user = user;
    this.password = password;
    this.secure = secure;
    this.options = options;
  }

  async connect() {
    try {
      await this.client.access({
        host: this.host,
        user: this.user,
        password: this.password,
        secure: this.secure
      });
    } catch (error) {
      console.error('Error connecting to FTP server:', error);
      throw error;
    }
  }

  closeConnection() {
    this.client.close();
  }

  async downloadDirectoryRecursively(localDir: string, remoteDir: string) {
    try {
      const files = await this.client.list(remoteDir);

      for (const file of files) {
        const { name, isDirectory, isFile } = file;

        const remoteFilePath = path.join(remoteDir, name);
        const localFilePath = path.join(localDir, name);
        const isValid = this.#filter(isFile, remoteFilePath);

        if (!isValid) {
          continue;
        }

        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }

        if (isDirectory) {
          await this.downloadDirectoryRecursively(
            localFilePath,
            remoteFilePath
          );
        }

        if (isFile) {
          await this.client.downloadTo(localFilePath, remoteFilePath);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error processing ${remoteDir}:`, error.message);
      }
    }
  }

  async uploadDirectoryRecursively(localDir: string, remoteDir: string) {
    try {
      const dirContent = fs.readdirSync(localDir);

      await this.client.ensureDir(remoteDir);

      for (const content of dirContent) {
        const fullPath = path.join(localDir, content);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          await this.uploadDirectoryRecursively(fullPath, content);
          await this.client.cdup();
        } else if (stats.isFile()) {
          await this.client.uploadFrom(fullPath, content);
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
      !match(path, this?.options?.includeFilter)
    ) {
      return false;
    }

    if (
      this?.options?.excludeFilter &&
      match(path, this?.options?.excludeFilter)
    ) {
      return false;
    }

    return true;
  }
}
