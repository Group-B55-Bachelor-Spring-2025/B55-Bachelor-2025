import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [AddressesModule],
})
export class LocationManagementModule {}
