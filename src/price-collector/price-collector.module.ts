import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceCollectorService } from './nordpool-service';
import { PriceCollectorController } from './price-collector.controller';
import { DayAheadPrice } from './day-ahead-price.entity';
import { RegionsModule } from '@app/location-management/regions/regions.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([DayAheadPrice]),
    RegionsModule,
  ],
  controllers: [PriceCollectorController],
  providers: [
    PriceCollectorService,
    {
      provide: 'PriceCollectorService',
      useExisting: PriceCollectorService,
    },
  ],
  exports: [PriceCollectorService, 'PriceCollectorService'],
})
export class PriceCollectorModule {}
