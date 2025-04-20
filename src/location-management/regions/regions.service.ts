import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Repository } from 'typeorm';
import { IRegionsService } from '../interfaces/region.interface';

@Injectable()
export class RegionsService implements IRegionsService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async findAll(): Promise<Region[]> {
    return await this.regionRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<Region> {
    const region = await this.regionRepository.findOne({
      where: { code },
      relations: ['addresses'],
    });
    if (!region) {
      throw new NotFoundException(`Region with code ${code} not found`);
    }
    return region;
  }
}
