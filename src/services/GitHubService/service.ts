import { SimpleGit, simpleGit, SimpleGitOptions } from 'simple-git';
import { GITHUB_SERVICE_DEFAULT_OPTIONS } from './constants.js';
import { EmailService } from '../EmailService/index.js';
import {
  CLONED_REPOSITORIES_DIR,
  OUTPUT_DIR
} from '../../constants/defaultPaths.js';
import { GITHUB_TAG_NAME } from '../../constants/env.js';
import fs from 'fs';

export class GitHubService {
  private readonly git: SimpleGit;
  private readonly remoteRepo: string;
  private readonly tag: string;
  private readonly repoName: string = '';
  private readonly clonePath: string = '';
  private readonly emailService = EmailService.getInstance();

  constructor(remoteRepo: string, tag: string, options?: SimpleGitOptions) {
    this.git = simpleGit(options ?? GITHUB_SERVICE_DEFAULT_OPTIONS);
    this.remoteRepo = remoteRepo;
    this.tag = tag;

    const urlParts = this.remoteRepo.split('/');

    this.repoName = urlParts[urlParts.length - 1].replace('.git', '');
    this.clonePath = `${OUTPUT_DIR}/${CLONED_REPOSITORIES_DIR}/${this.repoName}/${GITHUB_TAG_NAME}`;
  }

  async cloneRepoByTag(path: string) {
    try {
      console.log(
        `Starting to clone the repository from ${this.remoteRepo} into ${path}...`
      );

      fs.rmSync(this.clonePath, {
        recursive: true,
        force: true
      });
      fs.mkdirSync(this.clonePath, { recursive: true });

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

  getRepoName(): string {
    return this.repoName;
  }

  getClonePath(): string {
    return this.clonePath;
  }
}
