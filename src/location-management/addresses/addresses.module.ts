import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address } from './entities/address.entity';
import { Region } from '../regions/entities/region.entity';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Region]), AuthModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
