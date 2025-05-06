import { Injectable, Inject } from '@nestjs/common';
import { IPriceCollectorService } from '../price-collector/price-collector-interface';
import { DayAheadPrice } from '../price-collector/day-ahead-price.entity';

@Injectable()
export class PriceAnalyzerService {
  constructor(
    @Inject('PriceCollectorService')
    private readonly priceService: IPriceCollectorService,
  ) {}

  // Example: Get the cheapest hour index for today or a specific date
  async getCheapestHour(zone: string, date?: string): Promise<number | null> {
    const records = await this.priceService.getPricesForZone(zone);
    const target = date
      ? records.find((r) => r.date === date)
      : records[0]; // most recent if no date given

    if (!target || !target.prices || !target.prices.length) {
      return null;
    }

    const minIndex = target.prices.reduce(
      (lowestIndex, price, currentIndex, array) =>
        price < array[lowestIndex] ? currentIndex : lowestIndex,
      0,
    );

    return minIndex;
  }

  // Example: Get average price for the day
  async getAveragePrice(zone: string, date?: string): Promise<number | null> {
    const records = await this.priceService.getPricesForZone(zone);
    const target = date
      ? records.find((r) => r.date === date)
      : records[0];

    if (!target || !target.prices.length) return null;

    const sum = target.prices.reduce((acc, val) => acc + val, 0);
    return sum / target.prices.length;
  }
}
