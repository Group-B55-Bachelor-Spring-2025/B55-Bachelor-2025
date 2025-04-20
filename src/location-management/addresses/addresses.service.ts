import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Region } from '../regions/entities/region.entity';
import { Repository } from 'typeorm';
import { IAddressesService } from '../interfaces/address.interface';
@Injectable()
export class AddressesService implements IAddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const region = await this.regionRepository.findOneBy({
      code: createAddressDto.regionCode,
    });

    if (!region) {
      throw new NotFoundException(
        `Region with code ${createAddressDto.regionCode} not found`,
      );
    }
    const address = this.addressRepository.create({
      ...createAddressDto,
      region,
    });
    return this.addressRepository.save(address);
  }

  async findAll(): Promise<Address[]> {
    // TODO: Implement fetching addresses by user after creating the users and auth services
    return Promise.resolve([]);
  }

  async findOne(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['region'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['region'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (updateAddressDto.regionCode) {
      const region = await this.regionRepository.findOneBy({
        code: updateAddressDto.regionCode,
      });
      if (!region) {
        throw new NotFoundException(
          `Region with code ${updateAddressDto.regionCode} not found`,
        );
      }
      address.region = region;
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: number): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return this.addressRepository.remove(address);
  }
}
