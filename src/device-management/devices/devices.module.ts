import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { AuthModule } from '@app/auth/auth.module';
import { DeviceGroupsModule } from '../device-groups/device-groups.module';
import { Device } from './entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), AuthModule, DeviceGroupsModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
