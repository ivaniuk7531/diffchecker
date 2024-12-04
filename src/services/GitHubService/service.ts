import { SimpleGit, simpleGit } from 'simple-git';
import fs from 'fs';

export class GitHubService {
  private readonly git: SimpleGit;
  private readonly remoteRepo: string;
  private readonly tag: string;

  constructor(remoteRepo: string, tag: string) {
    this.git = simpleGit();
    this.remoteRepo = remoteRepo;
    this.tag = tag;
    this.init();
  }

  private init() {
    try {
      if (!this.remoteRepo) {
        throw new Error('Remote repository not found');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Init gitHubService error:', error);
      }
    }
  }

  async cloneRepoByTag(path: string) {
    try {
      if (fs.existsSync(path)) {
        fs.rmSync(path, {
          recursive: true,
          force: true
        });
        fs.mkdirSync(path, { recursive: true });
      }
      await this.git.clone(this.remoteRepo, path, [
        '--branch',
        this.tag,
        '--single-branch'
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error cloning repository:', error.message);
      }
    }
  }

  getRepoName(): string | undefined {
    try {
      const urlParts = this.remoteRepo.split('/');
      const repoNameWithGit = urlParts[urlParts.length - 1];
      return repoNameWithGit.replace('.git', '');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
    }
  }
}
