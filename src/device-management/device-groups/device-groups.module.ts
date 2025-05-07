import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceGroupsService } from './device-groups.service';
import { DeviceGroupsController } from './device-groups.controller';
import { DeviceGroup } from './entities/device-group.entity';
import { AuthModule } from '@app/auth/auth.module';
import { AddressesModule } from '@app/location-management/addresses/addresses.module';
import { ProvidersModule } from '@app/provider-management/core/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceGroup]),
    AuthModule,
    AddressesModule,
    ProvidersModule,
  ],
  controllers: [DeviceGroupsController],
  providers: [DeviceGroupsService],
  exports: [DeviceGroupsService],
})
export class DeviceGroupsModule {}
