import { DayAheadPrice } from '../price-collector/day-ahead-price.entity';

export interface IPriceDecisionService {
  checkIfPriceIsAcceptable(data: DayAheadPrice, manualOverride: boolean, options: { percentile: number }): boolean;
}