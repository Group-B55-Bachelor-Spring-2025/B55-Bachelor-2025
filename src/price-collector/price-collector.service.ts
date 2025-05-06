import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { DayAheadPrice } from './day-ahead-price.entity';
import { zoneEICMap } from '../zones/zone-map';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPriceCollectorService } from './price-interfaces';


@Injectable()
@Injectable()
export class PriceCollectorService implements IPriceCollectorService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(DayAheadPrice)
    private readonly priceRepo: Repository<DayAheadPrice>,
  ) {}

  //Schedule a cron job to fetch prices every 10 minutes
  @Cron(CronExpression.EVERY_HOUR) 
  async scheduledDailyFetch() {
    console.log('⏰ Running scheduled daily fetch...');
    await this.fetchAndStoreAllZones();
  }
  
  async fetchPricesForZone(zone: string): Promise<DayAheadPrice> {
    const eic = zoneEICMap[zone];
    if (!eic) throw new Error(`Unknown zone code: ${zone}`);

    const params = {
      documentType: 'A44',
      periodStart: '202407272200',
      periodEnd: '202407282200',
      out_Domain: eic,
      in_Domain: eic,
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
      throw new Error(`No TimeSeries returned for zone: ${zone}`);
    }

    const period = Array.isArray(timeSeries) ? timeSeries[0].Period : timeSeries.Period;
    const points = Array.isArray(period.Point) ? period.Point : [period.Point];
    const prices = points.map((pt: any) => Number(pt['price.amount']));

    const date = period.timeInterval.start.slice(0, 10); // 'YYYY-MM-DD'

    return this.priceRepo.create({
      zone,
      date,
      prices,
    });
  }

  async fetchAndStoreAllZones(): Promise<void> {
    const zones = Object.keys(zoneEICMap);
  
    for (const zone of zones) {
      try {
        const record = await this.fetchPricesForZone(zone);
  
        // ✅ Ensure we have exactly 24 prices
        if (record.prices.length !== 24) {
          console.warn(`⚠️ Caution ${zone} — expected 24 prices, got ${record.prices.length}`);
        }
  
        // ✅ Check if a record already exists for this zone & date
        const exists = await this.priceRepo.findOneBy({
          zone: record.zone,
          date: record.date,
        });
  
        if (exists) {
          console.log(`⏩ Skipping ${zone} ${record.date} — already exists in DB.`);
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
  

  async getPricesForZone(zone: string): Promise<DayAheadPrice[]> {
    return this.priceRepo.find({
      where: { zone },
      order: { date: 'DESC' },
    });
  }

  async getStoredPrices(): Promise<DayAheadPrice[]> {
    return await this.priceRepo.find({
      order: { zone: 'ASC', date: 'DESC' },
    });
  }

  async clearAllPrices(): Promise<void> {
    await this.priceRepo.clear();
    console.log('All prices cleared from the database.');
  }
}
