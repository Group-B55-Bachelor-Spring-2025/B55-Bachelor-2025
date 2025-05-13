import { DayAheadPrice } from './day-ahead-price.entity';
import { Region } from '@app/location-management/regions/entities/region.entity';

export interface IPriceCollectorService {
  fetchPricesForZone(zone: Region): Promise<DayAheadPrice>;

  fetchAndStoreAllZones(): Promise<void>;

  getPricesForZone(zone: string): Promise<DayAheadPrice | null>;

  getStoredPrices(): Promise<DayAheadPrice[]>;

  clearAllPrices(): Promise<void>;
}
