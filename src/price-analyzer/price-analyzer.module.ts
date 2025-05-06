import { Module } from '@nestjs/common';
import { PriceAnalyzerService } from './price-percentile-based';
import { PriceAnalyzerController } from './price-analyzer.controller';
import { PriceCollectorModule } from '../price-collector/price-collector.module';

@Module({
  imports: [PriceCollectorModule],
  controllers: [PriceAnalyzerController],
  providers: [PriceAnalyzerService],
  exports: [PriceAnalyzerService],
})
export class PriceAnalyzerModule {}
