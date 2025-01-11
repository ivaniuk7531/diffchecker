import { SimpleGit, simpleGit, SimpleGitOptions } from 'simple-git';
import { GITHUB_SERVICE_DEFAULT_OPTIONS } from './constants.js';
import {
  CLONED_REPOSITORIES_DIR,
  OUTPUT_DIR
} from '../../constants/defaultPaths.js';
import { GITHUB_TAG_NAME } from '../../constants/env.js';
import fs from 'fs';
import path from 'path';

export class GitHubService {
  private readonly git: SimpleGit;
  private readonly remoteRepo: string;
  private readonly tag: string;
  private readonly repoName: string = '';
  private readonly clonePath: string = '';

  constructor(remoteRepo: string, tag: string, options?: SimpleGitOptions) {
    this.git = simpleGit(options ?? GITHUB_SERVICE_DEFAULT_OPTIONS);
    this.remoteRepo = remoteRepo;
    this.tag = tag;

    const urlParts = this.remoteRepo.split('/');

    this.repoName = urlParts[urlParts.length - 1].replace('.git', '');
    this.clonePath = path.normalize(
      `${OUTPUT_DIR}/${CLONED_REPOSITORIES_DIR}/${this.repoName}/${GITHUB_TAG_NAME}`
    );
  }

  async setGitConfig() {
    try {
      await this.git.raw([
        'config',
        '--global',
        'url.https://github.com/.insteadOf',
        'git://github.com/'
      ]);
      console.log('Git configuration updated successfully!');
    } catch (error) {
      console.error('Error setting Git config:', error);
    }
  }

  async cloneRepoByTag(clonePath: string): Promise<void> {
    try {
      const normalizedClonePath = path.normalize(clonePath);

      fs.rmSync(this.clonePath, { recursive: true, force: true });
      fs.mkdirSync(this.clonePath, { recursive: true });

      await this.git.clone(this.remoteRepo, normalizedClonePath, [
        '--recurse',
        '--branch',
        this.tag,
        '--single-branch'
      ]);

      console.log(
        `Repository cloned successfully into ${normalizedClonePath} from branch/tag "${this.tag}".`
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error during cloning repository:', error);
      }

      throw error;
    }
  }

  getRepoName(): string {
    return this.repoName;
  }

  getClonePath(): string {
    return this.clonePath;
  }
}
