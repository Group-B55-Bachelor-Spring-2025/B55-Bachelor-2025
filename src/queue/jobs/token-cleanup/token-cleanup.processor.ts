import { Processor, OnQueueEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { TOKEN_CLEANUP_QUEUE } from './token-cleanup.queue';
import { TokensService } from '../../../auth/tokens/tokens.service';

@Injectable()
@Processor(TOKEN_CLEANUP_QUEUE)
export class TokenCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(TokenCleanupProcessor.name);

  constructor(private readonly tokensService: TokensService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'cleanup-tokens') {
      return;
    }

    this.logger.log(`Starting token cleanup job #${job.id}`);
    const removedCount = await this.tokensService.cleanupExpiredTokens();
    this.logger.log(`Cleaned up ${removedCount} expired tokens`);
    return { removedCount };
  }

  @OnQueueEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job ${job.id} completed successfully: cleaned up ${result?.removedCount || 0} tokens`,
    );
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
