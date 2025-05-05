import { Controller, Get, Param } from '@nestjs/common';
import { PriceCollectorService } from './price-collector.service';

@Controller('price-collector')
export class PriceCollectorController {
  constructor(private readonly priceCollectorService: PriceCollectorService) {}

  // Fetch prices from the database
  @Get('db/showall')
  async getFromDb() {
    return this.priceCollectorService.getStoredPrices();
  }

  // Fetch prices for all listed zones and store them in the database
  @Get('db/fetch-new')
  async fetchAndStoreAll() {
    await this.priceCollectorService.fetchAndStoreAllZones();
    return { message: 'Prices fetched and stored for all zones' };
  }
  
  // Fetch prices of a specific zone from the local database
  @Get('db/:zone')
  async getZonePrices(@Param('zone') zone: string) {
    return this.priceCollectorService.getPricesForZone(zone.toUpperCase());
  }

  //delete all prices from the database
  @Get('reset')
  async resetDB(@Param('zone') zone: string) {
    this.priceCollectorService.clearAllPrices()
    return {message: 'All prices cleared from the database.'};
  }
}
