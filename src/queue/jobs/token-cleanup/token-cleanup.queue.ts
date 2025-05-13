import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export const TOKEN_CLEANUP_QUEUE = 'token-cleanup-queue';

@Injectable()
export class TokenCleanupQueue {
  constructor(
    @InjectQueue(TOKEN_CLEANUP_QUEUE) private tokenCleanupQueue: Queue,
  ) {}

  async scheduleDailyCleanup() {
    // Schedule a job to run at midnight every day
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0,
      0,
      0,
      0, // midnight
    );

    // Calculate delay in milliseconds
    const delay = nextMidnight.getTime() - now.getTime();

    return await this.tokenCleanupQueue.add(
      'cleanup-tokens',
      {},
      {
        delay,
        repeat: {
          pattern: '0 0 * * *', // At midnight every day
        },
      },
    );
  }
}
