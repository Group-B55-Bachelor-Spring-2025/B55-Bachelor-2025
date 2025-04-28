import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class TokenCleanupTask {
  constructor(private tokensService: TokensService) {}

  @Cron('0 0 * * *' as string) // at midnight every day
  async handleTokenCleanup() {
    const removedCount = await this.tokensService.cleanupExpiredTokens();
    console.log(`Cleaned up ${removedCount} expired tokens`);
  }
}
