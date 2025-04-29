import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PriceCollectorService } from './price-collector.service';
import { PriceCollectorController } from './price-collector.controller';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayAheadPrice } from './day-ahead-price.entity';


@Module({
  imports: [
    HttpModule, 
    ConfigModule, 
    TypeOrmModule.forFeature([DayAheadPrice]),
  ],
  providers: [PriceCollectorService],
  controllers: [PriceCollectorController],
})
export class PriceCollectorModule {}
