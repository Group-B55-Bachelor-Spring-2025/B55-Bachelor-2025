import { Test, TestingModule } from '@nestjs/testing';
import { PriceCollectorController } from './price-collector.controller';

describe('PriceCollectorController', () => {
  let controller: PriceCollectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceCollectorController],
    }).compile();

    controller = module.get<PriceCollectorController>(PriceCollectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
