// src/price-collector/price-collector.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PriceCollectorService } from './price-collector.service';

@Controller('price-collector')
export class PriceCollectorController {
  constructor(private readonly priceCollectorService: PriceCollectorService) {}

  @Get('fetch')
  async fetchPrices() {
    return this.priceCollectorService.fetchElectricityPrices();
  }
}
