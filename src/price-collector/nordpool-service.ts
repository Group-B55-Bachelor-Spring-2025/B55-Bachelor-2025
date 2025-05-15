import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { DayAheadPrice } from './day-ahead-price.entity';
import { IPriceCollectorService } from './price-collector-interface';
import { RegionsService } from '@app/location-management/regions/regions.service';
import { Region } from '@app/location-management/regions/entities/region.entity';

@Injectable()
export class PriceCollectorService implements IPriceCollectorService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(DayAheadPrice)
    private readonly priceRepo: Repository<DayAheadPrice>,
    private readonly regionsService: RegionsService,
  ) {}

  async fetchPricesForZone(zone: Region): Promise<DayAheadPrice> {
    const now = new Date();

    // "Tomorrow" in UTC terms
    const tomorrow = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // tomorrow
        0,
        0,
      ),
    );

    // Format for API (UTC midnight start of tomorrow)
    const formatDate = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return (
        date.getUTCFullYear().toString() +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes())
      );
    };

    const periodStart = formatDate(
      new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000),
    ); // UTC - 2h = 22:00 previous day
    const periodEnd = formatDate(
      new Date(tomorrow.getTime() + 22 * 60 * 60 * 1000),
    ); // UTC + 22h = 22:00 next day

    const params = {
      documentType: 'A44',
      periodStart,
      periodEnd,
      out_Domain: zone.eicCode,
      in_Domain: zone.eicCode,
      'contract_MarketAgreement.type': 'A01',
      securityToken: this.configService.get<string>('PRICE_API_KEY'),
    };

    const response = await firstValueFrom(
      this.httpService.get('https://web-api.tp.entsoe.eu/api', {
        params,
        responseType: 'text',
      }),
    );

    const xml = response.data;
    const json = await parseStringPromise(xml, { explicitArray: false });

    const timeSeries = json?.Publication_MarketDocument?.TimeSeries;
    if (!timeSeries) {
      throw new Error(`No TimeSeries returned for zone: ${zone.name}`);
    }

    const period = Array.isArray(timeSeries)
      ? timeSeries[0].Period
      : timeSeries.Period;
    const points = Array.isArray(period.Point) ? period.Point : [period.Point];
    const prices = points.map((pt: any) => Number(pt['price.amount']));

    const date = period.timeInterval.start.slice(0, 10); // 'YYYY-MM-DD'

    return this.priceRepo.create({
      zone: zone.code,
      date,
      prices,
    });
  }

  async fetchAndStoreAllZones(): Promise<void> {
    const zones = await this.regionsService.getAllActiveRegions();

    for (const zone of zones) {
      try {
        const record = await this.fetchPricesForZone(zone);

        // ✅ Ensure we have exactly 24 prices
        if (record.prices.length !== 24) {
          console.warn(
            `⚠️ Caution ${zone} — expected 24 prices, got ${record.prices.length}`,
          );
        }

        // ✅ Check if a record already exists for this zone & date
        const exists = await this.priceRepo.findOneBy({
          zone: record.zone,
          date: record.date,
        });

        if (exists) {
          console.log(
            `⏩ Skipping ${zone} ${record.date} — already exists in DB.`,
          );
          continue;
        }

        await this.priceRepo.save(record);
        console.log(`✅ Saved prices for ${zone} ${record.date}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Error saving prices for ${zone}:`, error.message);
        } else {
          console.error(`❌ Error saving prices for ${zone}:`, error);
        }
      }
    }
  }

  async getPricesForZone(zone: string): Promise<DayAheadPrice | null> {
    return this.priceRepo.findOne({
      where: { zone },
      order: { date: 'DESC' },
    });
  }

  async getStoredPrices(): Promise<DayAheadPrice[]> {
    return await this.priceRepo.find({
      order: { zone: 'ASC', date: 'DESC' },
    });
  }

  async getPricesForDateAndZone(
    date: Date,
    zone_code: string,
  ): Promise<DayAheadPrice | null> {
    return this.priceRepo.findOneBy({ date, zone: zone_code });
  }

  async clearAllPrices(): Promise<void> {
    await this.priceRepo.clear();
    console.log('All prices cleared from the database.');
  }
}
