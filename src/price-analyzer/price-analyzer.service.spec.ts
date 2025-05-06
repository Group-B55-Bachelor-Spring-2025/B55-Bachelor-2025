import { Test, TestingModule } from '@nestjs/testing';
import { PriceAnalyzerService } from './price-analyzer.service';

describe('PriceAnalyzerService', () => {
  let service: PriceAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceAnalyzerService],
    }).compile();

    service = module.get<PriceAnalyzerService>(PriceAnalyzerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
