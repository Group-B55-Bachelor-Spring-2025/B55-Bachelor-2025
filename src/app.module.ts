import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
export class AppModule {}
