export type BytesRead = number;

export type FileServiceReadLinesResult = {
  lines: string[];
  rest: string;
  reachedEof: boolean;
};
