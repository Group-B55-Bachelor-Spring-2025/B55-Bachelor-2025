import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueInitializerService } from './queue-initializer.service';
import { QueueController } from './queue.controller';
import { TOKEN_CLEANUP_QUEUE } from './jobs/token-cleanup/token-cleanup.queue';
import { TokenCleanupQueue } from './jobs/token-cleanup/token-cleanup.queue';
import { TokenCleanupProcessor } from './jobs/token-cleanup/token-cleanup.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6380'), 10),
        },
      }),
    }),
    BullModule.registerQueue({
      name: TOKEN_CLEANUP_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [QueueController],
  providers: [
    TokenCleanupQueue,
    TokenCleanupProcessor,
    QueueInitializerService,
  ],
  exports: [BullModule, TokenCleanupQueue, QueueInitializerService],
})
export class QueueModule {}
