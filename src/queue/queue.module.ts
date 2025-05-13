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

@Module({
  imports: [
    PriceCollectorModule,
    AuthModule,
    TypeOrmModule.forFeature([Device, ProviderCredential]),
    ProvidersModule,
    MillModule,
    ProviderCredentialsModule,
    DevicesModule,
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
  ],
  controllers: [QueueController],
  providers: [
    PriceCollectorQueue,
    PriceCollectorProcessor,
    TokenCleanupQueue,
    TokenCleanupProcessor,
    DeviceUpdateQueue,
    DeviceUpdateProcessor,
    QueueInitializerService,
  ],
  exports: [
    PriceCollectorQueue,
    TokenCleanupQueue,
    DeviceUpdateQueue,
    QueueInitializerService,
  ],
})
export class QueueModule {}
