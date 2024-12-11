import { SimpleGit, simpleGit, SimpleGitOptions } from 'simple-git';
import fs from 'fs';
import { GITHUB_SERVICE_DEFAULT_OPTIONS } from './constants.js';
import { EmailService } from '../EmailService/index.js';

export class GitHubService {
  private readonly git: SimpleGit;
  private readonly remoteRepo: string;
  private readonly tag: string;
  private readonly emailService = EmailService.getInstance();

  constructor(remoteRepo: string, tag: string, options?: SimpleGitOptions) {
    this.git = simpleGit(options ?? GITHUB_SERVICE_DEFAULT_OPTIONS);
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
      console.log(
        `Starting to clone the repository from ${this.remoteRepo} into ${path}...`
      );

      await this.git.clone(this.remoteRepo, path, [
        '--recurse',
        '--branch',
        this.tag,
        '--single-branch'
      ]);

      console.log(
        `Repository cloned successfully into ${path} from branch/tag "${this.tag}".`
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error during cloning repository:', error.message);

        await this.emailService.sendEmail(
          'Error during cloning repository',
          error.message
        );
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
