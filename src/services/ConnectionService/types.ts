import { IStatisticsResults } from '../DiffCheckerService/index.js';

export enum ConnectionType {
  FTP = 'FTP',
  SFTP = 'SFTP'
}

export interface IConnectionClient {
  connect(): Promise<void> | void;
  closeConnection(): Promise<void> | void;
  downloadFiles(filePath: string, destination: string): Promise<void> | void;
  uploadFiles(data: IStatisticsResults): Promise<string[] | undefined>;
}
