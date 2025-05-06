export interface IPriceAnalyzerService {

    getCheapestHour(zone: string, date?: string): Promise<number>; // returns hour index

    getAveragePrice(zone: string, date?: string): Promise<number>;
    
    getPriceExtremes(zone: string, date?: string): Promise<{ min: number; max: number }>;
  }
  