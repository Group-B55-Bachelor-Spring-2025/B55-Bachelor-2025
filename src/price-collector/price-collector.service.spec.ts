import { Test, TestingModule } from '@nestjs/testing';
import { PriceCollectorService } from './nordpool-service';

describe('PriceCollectorService', () => {
  let service: PriceCollectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceCollectorService],
    }).compile();

    service = module.get<PriceCollectorService>(PriceCollectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
