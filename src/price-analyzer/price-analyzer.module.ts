import { Module } from '@nestjs/common';
import { PriceAnalyzerService } from './price-analyzer.service';
import { PriceCollectorModule } from '../price-collector/price-collector.module'; // Adjust the import path as necessary

@Module({
  imports: [PriceCollectorModule], 
  providers: [PriceAnalyzerService],
  exports: [PriceAnalyzerService],
})
export class PriceAnalyzerModule {}
