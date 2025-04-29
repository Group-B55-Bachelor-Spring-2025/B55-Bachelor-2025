import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { DayAheadPrice } from './day-ahead-price.entity';
import { zoneEICMap } from '../zones/zone-map';


@Injectable()
export class PriceCollectorService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(DayAheadPrice)
    private readonly priceRepo: Repository<DayAheadPrice>,
  ) {}

  async fetchPricesForZone(zone: string): Promise<Partial<DayAheadPrice>[]> {
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
  
    const timeSeries = json.Publication_MarketDocument.TimeSeries;
    const period = Array.isArray(timeSeries) ? timeSeries[0].Period : timeSeries.Period;
    const points = Array.isArray(period.Point) ? period.Point : [period.Point];
  
    return points.map((pt: any) => ({
      position: Number(pt.position),
      price: Number(pt['price.amount']),
      zone,
    }));
  }
  
  async fetchAndStoreAllZones(): Promise<void> {
    const zones = Object.keys(zoneEICMap);
  
    this.clearAllPrices();

    for (const zone of zones) {
      try {
        const rawPrices = await this.fetchPricesForZone(zone);
        const records = rawPrices.map(p => this.priceRepo.create(p));
        await this.priceRepo.save(records);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error saving prices for ${zone}:`, error.message);
        } else {
          console.error(`Error saving prices for ${zone}:`, error);
        }
      }
    }
  }

  async getPricesForZone(zone: string): Promise<DayAheadPrice[]> {
    return this.priceRepo.find({
      where: { zone },
      order: { position: 'ASC' }, // Optional: make sure prices are sorted
    });
  }

  async getStoredPrices(): Promise<DayAheadPrice[]> {
    return await this.priceRepo.find();
  }

  async clearAllPrices(): Promise<void> {
    await this.priceRepo.clear(); // DANGER: deletes everything!
    console.log('All prices cleared from the database.');
  }
  
}
