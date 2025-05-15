import { Controller, Get, Param, Query } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PriceAnalyzerService } from './price-percentile-based';
import { IPriceCollectorService } from '../price-collector/price-collector-interface';
import { DayAheadPrice } from 'src/price-collector/day-ahead-price.entity';

@Controller('analyze')
export class PriceAnalyzerController {
  constructor(
    private readonly analyzerService: PriceAnalyzerService,
    @Inject('PriceCollectorService')
    private readonly priceCollectorService: IPriceCollectorService,
  ) {}

  // 🔧 Test with hardcoded mock data
  @Get('test/mock')
  testWithMockData(
    @Query('percentile') percentile?: string,
    @Query('override') override?: string,
  ) {
    const mockPriceData: DayAheadPrice = {
      zone: 'TEST',
      date: new Date('2025-05-06'),
      prices: [
        10.5, 9.8, 11.2, 12.0, 13.4, 15.0, 16.5, 17.0, 14.2, 13.5, 12.8, 10.0,
        8.7, 7.5, 5.4, 3.2, 4.1, 6.9, 9.2, 11.1, 13.3, 14.8, 13.9, 10.4,
      ],
      fetchedAt: new Date(),
    };

    const manualOverride = override === 'true';
    const parsedPercentile = percentile ? parseInt(percentile, 10) : 75;

    const result = this.analyzerService.checkIfPriceIsAcceptable(
      mockPriceData,
      manualOverride,
      {
        percentile: parsedPercentile,
      },
    );

    return {
      zone: mockPriceData.zone,
      date: mockPriceData.date,
      currentHour: new Date().getHours(),
      manualOverride,
      percentile: parsedPercentile,
      decision: result ? '✅ ON' : '❌ OFF',
    };
  }

  // 🛰️ Test using latest stored DB data
  @Get('test/:zone')
  async testWithRealData(
    @Param('zone') zone: string,
    @Query('percentile') percentile?: string,
    @Query('override') override?: string,
  ) {
    const latest = await this.priceCollectorService.getPricesForZone(
      zone.toUpperCase(),
    );

    if (!latest) {
      return { error: `No price data found for zone ${zone.toUpperCase()}` };
    }

    const manualOverride = override === 'true';
    const parsedPercentile = percentile ? parseInt(percentile, 10) : 25;

    const currentHour = new Date().getHours();
    const currentPrice = latest.prices[currentHour];

    const thresholdValue = this.analyzerService['calculatePercentileThreshold'](
      latest.prices,
      parsedPercentile,
    );

    const shouldActivate = this.analyzerService.checkIfPriceIsAcceptable(
      latest,
      manualOverride,
      {
        percentile: parsedPercentile,
      },
    );

    return {
      zone: latest.zone,
      date: latest.date,
      currentHour,
      currentPrice,
      manualOverride,
      percentile: parsedPercentile,
      thresholdValue,
      decision: shouldActivate
        ? '✅ Activate device'
        : '❌ Do not activate device',
    };
  }
  @Get('test/mock/all')
  evaluateAllHoursForMock() {
    const mockPriceData: DayAheadPrice = {
      zone: 'MOCK',
      date: new Date('2025-05-06'),
      prices: [
        12, 14, 13, 11, 9, 8, 6, 7, 10, 15, 18, 22, 25, 30, 28, 27, 24, 20, 16,
        14, 12, 10, 8, 7,
      ],
      fetchedAt: new Date(),
    };

    const percentile = 80;
    const manualOverride = false;
    const threshold = this.analyzerService['calculatePercentileThreshold'](
      mockPriceData.prices,
      percentile,
    );

    const results = mockPriceData.prices.map((price, hour) => {
      const shouldActivate = price <= threshold;

      return {
        hour,
        price,
        threshold,
        activate: shouldActivate ? '✅ ON' : '❌ OFF',
      };
    });

    return {
      zone: mockPriceData.zone,
      date: mockPriceData.date,
      percentile,
      threshold,
      results,
    };
  }
}
