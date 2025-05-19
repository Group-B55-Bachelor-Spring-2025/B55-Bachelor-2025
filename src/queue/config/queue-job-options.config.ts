import { Injectable } from '@nestjs/common';

/**
 * Service for providing standard job options for different queue types
 */
@Injectable()
export class QueueJobOptionsConfig {
  /**
   * Standard job options for scheduled jobs
   * These jobs run at specific times and should retain history
   */
  getScheduledJobOptions() {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    };
  }

  /**
   * Job options for high-volume jobs
   * These jobs occur frequently and should cleanup aggressively
   */
  getHighVolumeJobOptions() {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    };
  }

  /**
   * Job options for tasks that should keep more history
   * Useful for debugging and monitoring patterns
   */
  getMonitoredJobOptions() {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 100,
    };
  }
}
