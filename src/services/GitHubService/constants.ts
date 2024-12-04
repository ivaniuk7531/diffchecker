import { SimpleGitOptions } from 'simple-git';

export const GITHUB_SERVICE_DEFAULT_OPTIONS: Partial<SimpleGitOptions> = {
  maxConcurrentProcesses: 10,
  progress({ method, stage, progress }) {
    console.log(`git.${method} ${stage} stage ${progress}% complete`);
  }
};
