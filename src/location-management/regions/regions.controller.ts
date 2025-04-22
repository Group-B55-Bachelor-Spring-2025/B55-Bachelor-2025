import { Controller, Get, Param } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { Region } from './entities/region.entity';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  async findAll(): Promise<Region[]> {
    return await this.regionsService.findAll();
  }

  @Get(':regionCode')
  async findOne(
    @Param('regionCode') regionCode: string,
  ): Promise<Region | null> {
    return await this.regionsService.findByCode(regionCode);
  }
}
