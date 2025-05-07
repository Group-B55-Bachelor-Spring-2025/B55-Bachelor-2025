import { Controller, Get, Param, Inject } from '@nestjs/common';
import { IPriceCollectorService } from './price-collector-interface';

@Controller('price-collector')
export class PriceCollectorController {
  constructor(
    @Inject('PriceCollectorService')
    private readonly priceCollectorService: IPriceCollectorService
  ) {}

  @Get('db/showall')
  async getFromDb() {
    return this.priceCollectorService.getStoredPrices();
  }

  @Get('db/fetch-new')
  async fetchAndStoreAll() {
    await this.priceCollectorService.fetchAndStoreAllZones();
    return { message: 'Prices fetched and stored for all zones' };
  }

  @Get('db/:zone')
  async getZonePrices(@Param('zone') zone: string) {
    return this.priceCollectorService.getPricesForZone(zone.toUpperCase());
  }

  @Get('reset')
  async resetDB() {
    await this.priceCollectorService.clearAllPrices();
    return { message: 'All prices cleared from the database.' };
  }
}
