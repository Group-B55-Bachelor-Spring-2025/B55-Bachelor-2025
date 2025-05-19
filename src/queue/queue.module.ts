import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

// Queue names and classes
import {
  PRICE_COLLECTOR_QUEUE,
  PriceCollectorQueue,
} from './jobs/price-collector/price-collector.queue';
import {
  TOKEN_CLEANUP_QUEUE,
  TokenCleanupQueue,
} from './jobs/token-cleanup/token-cleanup.queue';
import {
  DEVICE_UPDATE_QUEUE,
  DeviceUpdateQueue,
} from './jobs/device-update/device-update.queue';
import {
  PEAK_HOUR_ADJUSTMENT_QUEUE,
  PeakHourAdjustmentQueue,
} from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';

// Processors
import { PriceCollectorProcessor } from './jobs/price-collector/price-collector.processor';
import { TokenCleanupProcessor } from './jobs/token-cleanup/token-cleanup.processor';
import { DeviceUpdateProcessor } from './jobs/device-update/device-update.processor';
import { PeakHourAdjustmentProcessor } from './jobs/peak-hour-adjustment/peak-hour-adjustment.processor';

// Services
import { QueueInitializerService } from './queue-initializer.service';
import { QueueController } from './queue.controller';

// Configuration
import { RedisConnectionConfig } from './config/redis-connection.config';
import { QueueJobOptionsConfig } from './config/queue-job-options.config';

// Entity imports
import { Device } from '@app/device-management/devices/entities/device.entity';
import { ProviderCredential } from '@app/provider-management/core/credentials/entities/provider-credential.entity';

// Module imports
import { PriceCollectorModule } from '../price-collector/price-collector.module';
import { AuthModule } from '../auth/auth.module';
import { ProvidersModule } from '@app/provider-management/core/providers/providers.module';
import { MillModule } from '@app/provider-management/adapters/mill/mill.module';
import { ProviderCredentialsModule } from '@app/provider-management/core/credentials/provider-credentials.module';
import { DevicesModule } from '@app/device-management/devices/devices.module';
import { DeviceGroupsModule } from '@app/device-management/device-groups/device-groups.module';
import { SmartControlSettingsModule } from '@app/smart-control/smart-control-settings/smart-control-settings.module';

/**
 * QueueModule handles all background job processing for the application
 * using BullMQ with Redis as the backing store
 */
@Module({
  imports: [
    // Feature modules
    PriceCollectorModule,
    AuthModule,
    TypeOrmModule.forFeature([Device, ProviderCredential]),
    ProvidersModule,
    MillModule,
    ProviderCredentialsModule,
    DevicesModule,
    DeviceGroupsModule,
    SmartControlSettingsModule,

    // Register queues with their specific configuration
    BullModule.registerQueueAsync({
      name: PRICE_COLLECTOR_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = new RedisConnectionConfig(configService);
        const jobOptionsConfig = new QueueJobOptionsConfig();
        return redisConfig.getConnectionOptions(
          jobOptionsConfig.getScheduledJobOptions(),
        );
      },
    }),

    BullModule.registerQueueAsync({
      name: TOKEN_CLEANUP_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = new RedisConnectionConfig(configService);
        return redisConfig.getConnectionOptions(); // Use default options
      },
    }),

    BullModule.registerQueueAsync({
      name: DEVICE_UPDATE_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = new RedisConnectionConfig(configService);
        const jobOptionsConfig = new QueueJobOptionsConfig();
        return redisConfig.getConnectionOptions(
          jobOptionsConfig.getHighVolumeJobOptions(),
        );
      },
    }),

    BullModule.registerQueueAsync({
      name: PEAK_HOUR_ADJUSTMENT_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = new RedisConnectionConfig(configService);
        const jobOptionsConfig = new QueueJobOptionsConfig();
        return redisConfig.getConnectionOptions(
          jobOptionsConfig.getMonitoredJobOptions(),
        );
      },
    }),
  ],
  controllers: [QueueController],
  providers: [
    // Configuration services
    RedisConnectionConfig,
    QueueJobOptionsConfig,

    // Queue classes
    PriceCollectorQueue,
    TokenCleanupQueue,
    DeviceUpdateQueue,
    PeakHourAdjustmentQueue,

    // Processors
    PriceCollectorProcessor,
    TokenCleanupProcessor,
    DeviceUpdateProcessor,
    PeakHourAdjustmentProcessor,

    // Initializer service
    QueueInitializerService,
  ],
  exports: [
    PriceCollectorQueue,
    TokenCleanupQueue,
    DeviceUpdateQueue,
    PeakHourAdjustmentQueue,
    QueueInitializerService,
  ],
})
export class QueueModule {}
