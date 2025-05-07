import { Injectable } from '@nestjs/common';
import { DayAheadPrice } from '../price-collector/day-ahead-price.entity';
import { IPriceDecisionService } from './price-analyzer.interface';

@Injectable()
export class PriceAnalyzerService implements IPriceDecisionService {

  shouldActivate(data: DayAheadPrice, manualOverride: boolean, options: { percentile: number }): boolean {
    if (manualOverride) return true;
  
    if (!data?.prices?.length || data.prices.length !== 24) return false;
  
    const currentHour = new Date().getHours();
    const currentPrice = data.prices[currentHour];
  
    const threshold = this.calculatePercentileThreshold(data.prices, options.percentile);
  
    return currentPrice <= threshold;
  }
  
  private calculatePercentileThreshold(prices: number[], percentile: number): number {
    const sorted = [...prices].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index];
  }
}
