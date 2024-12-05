import { CronJob } from 'cron';
import { DEFAULT_JOB_TIME } from './constants.js';

export class CronService {
  private isRunning: boolean = false;

  createJob(
    cronTime = DEFAULT_JOB_TIME,
    job: () => Promise<void> | void,
    start: boolean = false,
    runOnInit: boolean = true,
    timeZone = 'UTC'
  ): CronJob {
    return CronJob.from({
      cronTime: cronTime,
      onTick: async () => {
        if (this.isRunning) return;

        this.isRunning = true;
        try {
          await job();
        } catch (error) {
          console.error('Error running job:', error);
        } finally {
          this.isRunning = false;
        }
      },
      runOnInit,
      start,
      timeZone
    });
  }
}
