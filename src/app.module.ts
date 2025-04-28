import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LocationManagementModule } from './location-management/location-management.module';
import { AddressesModule } from './location-management/addresses/addresses.module';
import { ProvidersModule } from './provider-management/providers/providers.module';
import { DeviceGroupsModule } from './device-management/device-groups/device-groups.module';
import { DevicesModule } from './device-management/devices/devices.module';
import { ProviderCredentialsModule } from './provider-management/provider-credentials/provider-credentials.module';
import { SmartControlSettingsModule } from './smart-control/smart-control-settings/smart-control-settings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Database
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_NAME: Joi.string().required(),

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
