import { Injectable, OnModuleInit } from '@nestjs/common';
import { TokenCleanupQueue } from './jobs/token-cleanup/token-cleanup.queue';

@Injectable()
export class QueueInitializerService implements OnModuleInit {
  constructor(private readonly tokenCleanupQueue: TokenCleanupQueue) {}

  /**
   * Initialize all queue jobs when the application starts
   */
  async onModuleInit() {
    await this.initializeTokenCleanupQueue();
  }

  // schedule token cleanup job
  private async initializeTokenCleanupQueue(): Promise<void> {
    await this.tokenCleanupQueue.scheduleDailyCleanup();
    console.log('🧹 Scheduled daily token cleanup job');
  }
}
