import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PriceCollectorService } from './price-collector.service';
import { PriceCollectorController } from './price-collector.controller';
import { DayAheadPrice } from './day-ahead-price.entity';
import { IPriceCollectorService } from './price-collector-interface';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([DayAheadPrice]),
  ],
  controllers: [PriceCollectorController],
  providers: [
    {
      provide: 'PriceCollectorService',
      useClass: PriceCollectorService,
    },
  ],
  exports: ['PriceCollectorService'],
})
export class PriceCollectorModule {}
