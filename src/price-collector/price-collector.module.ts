import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PriceCollectorService } from './price-collector.service';
import { PriceCollectorController } from './price-collector.controller';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PriceCollectorService],
  controllers: [PriceCollectorController],
})
export class PriceCollectorModule {}
