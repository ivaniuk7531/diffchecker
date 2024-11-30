import { SimpleGit, simpleGit } from 'simple-git';

export class GitHubService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async cloneRepoByTag(repoUrl: string, localPath: string, tag: string) {
    try {
      if (!repoUrl || !localPath || !tag) {
        throw new Error(
          'Invalid input parameters. Please provide a valid repository URL, local path, and tag.'
        );
      }

      await this.git.clone(repoUrl, `${localPath}/${tag}`, [
        '--branch',
        tag,
        '--single-branch'
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error cloning repository:', error.message);
      }
    }
  }

  static getRepoName(repoUrl: string): string | undefined {
    try {
      const urlParts = repoUrl.split('/');
      const repoNameWithGit = urlParts[urlParts.length - 1];
      return repoNameWithGit.replace('.git', '');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
    }
  }
}
