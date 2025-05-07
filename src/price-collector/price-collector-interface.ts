import { DayAheadPrice } from './day-ahead-price.entity';

export interface IPriceCollectorService {

  fetchPricesForZone(zone: string): Promise<DayAheadPrice>;

  fetchAndStoreAllZones(): Promise<void>;

  getPricesForZone(zone: string): Promise<DayAheadPrice | null>;


  getStoredPrices(): Promise<DayAheadPrice[]>;
  
  clearAllPrices(): Promise<void>;
}
