import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LocationManagementModule } from './location-management/location-management.module';
import { AddressesModule } from './location-management/addresses/addresses.module';
import { ProvidersModule } from './provider-management/core/providers/providers.module';
import { DeviceGroupsModule } from './device-management/device-groups/device-groups.module';
import { DevicesModule } from './device-management/devices/devices.module';
import { ProviderCredentialsModule } from './provider-management/core/credentials/provider-credentials.module';
import { SmartControlSettingsModule } from './smart-control/smart-control-settings/smart-control-settings.module';
import { PriceCollectorModule } from './price-collector/price-collector.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { PriceAnalyzerModule } from './price-analyzer/price-analyzer.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as cookieParser from 'cookie-parser';
import { RegionsModule } from './location-management/regions/regions.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Database - Support both local and prod
        DB_HOST: Joi.string(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string(),
        DB_PASS: Joi.string(),
        DB_NAME: Joi.string(),

        PGHOST: Joi.string(),
        PGPORT: Joi.number().default(5432),
        PGUSER: Joi.string(),
        PGPASSWORD: Joi.string(),
        PGDATABASE: Joi.string(),
        DATABASE_URL: Joi.string(),

        // Redis
        REDIS_HOST: Joi.string(),
        REDIS_PORT: Joi.number(),
        REDISHOST: Joi.string(),
        REDISPORT: Joi.number(),
        REDISUSER: Joi.string(),
        REDISPASSWORD: Joi.string(),

        // Application
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    UsersModule,
    AuthModule,
    DatabaseModule,
    AddressesModule,
    LocationManagementModule,
    ProvidersModule,
    ProviderCredentialsModule,
    DeviceGroupsModule,
    DevicesModule,
    SmartControlSettingsModule,
    PriceCollectorModule,
    ScheduleModule.forRoot(),
    PriceAnalyzerModule,
    RegionsModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
