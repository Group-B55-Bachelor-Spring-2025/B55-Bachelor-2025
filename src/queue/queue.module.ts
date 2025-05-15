import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PRICE_COLLECTOR_QUEUE } from './jobs/price-collector/price-collector.queue';
import { PriceCollectorQueue } from './jobs/price-collector/price-collector.queue';
import { PriceCollectorProcessor } from './jobs/price-collector/price-collector.processor';
import { QueueInitializerService } from './queue-initializer.service';
import { PriceCollectorModule } from '../price-collector/price-collector.module';
import { QueueController } from './queue.controller';
import { TOKEN_CLEANUP_QUEUE } from './jobs/token-cleanup/token-cleanup.queue';
import { TokenCleanupQueue } from './jobs/token-cleanup/token-cleanup.queue';
import { TokenCleanupProcessor } from './jobs/token-cleanup/token-cleanup.processor';
import { DEVICE_UPDATE_QUEUE } from './jobs/device-update/device-update.queue';
import { DeviceUpdateQueue } from './jobs/device-update/device-update.queue';
import { DeviceUpdateProcessor } from './jobs/device-update/device-update.processor';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '@app/device-management/devices/entities/device.entity';
import { ProviderCredential } from '@app/provider-management/core/credentials/entities/provider-credential.entity';
import { ProvidersModule } from '@app/provider-management/core/providers/providers.module';
import { MillModule } from '@app/provider-management/adapters/mill/mill.module';
import { ProviderCredentialsModule } from '@app/provider-management/core/credentials/provider-credentials.module';
import { DevicesModule } from '@app/device-management/devices/devices.module';
import { PEAK_HOUR_ADJUSTMENT_QUEUE } from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';
import { PeakHourAdjustmentQueue } from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';
import { PeakHourAdjustmentProcessor } from './jobs/peak-hour-adjustment/peak-hour-adjustment.processor';
import { DeviceGroupsModule } from '@app/device-management/device-groups/device-groups.module';
import { SmartControlSettingsModule } from '@app/smart-control/smart-control-settings/smart-control-settings.module';

@Module({
  imports: [
    PriceCollectorModule,
    AuthModule,
    TypeOrmModule.forFeature([Device, ProviderCredential]),
    ProvidersModule,
    MillModule,
    ProviderCredentialsModule,
    DevicesModule,
    DeviceGroupsModule,
    SmartControlSettingsModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6380'), 10),
        },
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
      name: PRICE_COLLECTOR_QUEUE,
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6380'), 10),
        },
      }),
      name: TOKEN_CLEANUP_QUEUE,
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6380'), 10),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      }),
      name: DEVICE_UPDATE_QUEUE,
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6380'), 10),
        },
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
      name: PEAK_HOUR_ADJUSTMENT_QUEUE,
    }),
  ],
  controllers: [QueueController],
  providers: [
    PriceCollectorQueue,
    PriceCollectorProcessor,
    TokenCleanupQueue,
    TokenCleanupProcessor,
    DeviceUpdateQueue,
    DeviceUpdateProcessor,
    PeakHourAdjustmentQueue,
    PeakHourAdjustmentProcessor,
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
