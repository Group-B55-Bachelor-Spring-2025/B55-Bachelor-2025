import { Controller, Get, Param } from '@nestjs/common';
import { PriceCollectorService } from './price-collector.service';

@Controller('price-collector')
export class PriceCollectorController {
  constructor(private readonly priceCollectorService: PriceCollectorService) {}

  // Fetch prices from the database
  @Get('db')
  async getFromDb() {
    return this.priceCollectorService.getStoredPrices();
  }

  // Fetch prices for all listed zones and store them in the database
  @Get('store/all')
  async fetchAndStoreAll() {
    await this.priceCollectorService.fetchAndStoreAllZones();
    return { message: 'Prices fetched and stored for all zones' };
  }
  
  @Get('db/:zone')
  async getZonePrices(@Param('zone') zone: string) {
    return this.priceCollectorService.getPricesForZone(zone.toUpperCase());
  }

  @Get('reset')
  async resetDB(@Param('zone') zone: string) {
    return this.priceCollectorService.clearAllPrices;
  }
}
