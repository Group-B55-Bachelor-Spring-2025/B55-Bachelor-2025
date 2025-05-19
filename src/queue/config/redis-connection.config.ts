import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

@Injectable()
export class RedisConnectionConfig {
  private readonly logger = new Logger(RedisConnectionConfig.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get Redis connection options with specified job options
   * @param jobOptions Default job options to use for this queue
   * @returns Queue configuration options
   */
  getConnectionOptions(jobOptions?: any): QueueOptions {
    const connectionConfig = this.getRedisConnectionConfig();

    return {
      connection: connectionConfig,
      defaultJobOptions: jobOptions || {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    };
  }

  /**
   * Get Redis connection configuration from environment variables
   * Supports both URL format and individual parameter format
   */
  private getRedisConnectionConfig(): any {
    const url = this.configService.get<string>('REDIS_URL') || '';
    if (url && url !== '') {
      const redisUrl = new URL(url);
      this.logger.log(`Using Redis URL: ${redisUrl}`);
      // If we have a complete URL, return it directly
      return redisUrl;
    } else {
      // Otherwise, use individual connection parameters
      const host = this.configService.get(
        'REDISHOST',
        this.configService.get('REDIS_HOST', 'localhost'),
      );
      const port = parseInt(
        this.configService.get(
          'REDISPORT',
          this.configService.get('REDIS_PORT', '6379'),
        ),
        10,
      );
      const username = this.configService.get('REDISUSER');
      const password = this.configService.get('REDISPASSWORD');

      this.logger.log(
        `Using Redis connection parameters - Host: ${host}, Port: ${port}, Username: ${username ? '(set)' : '(not set)'}, Password: ${password ? '(set)' : '(not set)'}`,
      );

      return {
        host,
        port,
        username,
        password,
      };
    }
  }
}
