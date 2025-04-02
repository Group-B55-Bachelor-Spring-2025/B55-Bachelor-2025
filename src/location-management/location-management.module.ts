import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';
import { RegionsModule } from './regions/regions.module';

@Module({
  imports: [AddressesModule, RegionsModule],
})
export class LocationManagementModule {}
