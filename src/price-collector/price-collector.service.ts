import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { firstValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';

// Define a type for the price points
export interface PricePoint {
  position: number;
  price: number;
}

@Injectable()
export class PriceCollectorService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async fetchElectricityPrices(): Promise<PricePoint[]> {
    const apiUrl = 'https://web-api.tp.entsoe.eu/api';
    const params = {
      documentType: 'A44',
      periodStart: '202407272200',
      periodEnd: '202407282200',
      out_Domain: '10YAT-APG------L',
      in_Domain: '10YAT-APG------L',
      'contract_MarketAgreement.type': 'A01',
      securityToken: this.configService.get<string>('PRICE_API_KEY'),
    };

    // Get the raw XML
    const response = await firstValueFrom(
      this.httpService.get(apiUrl, { params, responseType: 'text' })
    );
    const xml: string = response.data;

    // Parse the XML into a JS object
    const json = await parseStringPromise(xml, { explicitArray: false });

    // Drill into the relevant part of the JSON
    const timeSeries = json.Publication_MarketDocument.TimeSeries;
    const period = Array.isArray(timeSeries) ? timeSeries[0].Period : timeSeries.Period;
    const points = Array.isArray(period.Point) ? period.Point : [period.Point];

    // Map and type the points
    const priceArray: PricePoint[] = points.map((pt: any): PricePoint => ({
      position: Number(pt.position),
      price: Number(pt['price.amount']),
    }));

    return priceArray;
  }
}
