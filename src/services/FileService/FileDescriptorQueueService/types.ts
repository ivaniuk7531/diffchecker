export type OpenFileFlags = string;
export type OpenFileCallback = (
  err: NodeJS.ErrnoException | null,
  fd: number
) => void;
export type Job = {
  path: string;
  flags: OpenFileFlags;
  callback: OpenFileCallback;
};
