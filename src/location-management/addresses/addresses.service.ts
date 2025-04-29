import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Region } from '../regions/entities/region.entity';
import { Repository } from 'typeorm';
import { IAddressesService } from '../interfaces/address.interface';
import { Role } from '@app/users/enums/role.enum';
@Injectable()
export class AddressesService implements IAddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(
    createAddressDto: CreateAddressDto,
    userId: number,
  ): Promise<Address> {
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
      user: { id: userId },
      region,
    });
    return this.addressRepository.save(address);
  }

  async findAll(role: Role, userId?: number): Promise<Address[]> {
    if (role === Role.ADMIN) {
      return await this.addressRepository.find({
        relations: ['region'],
      });
    } else if (role === Role.USER && userId) {
      return await this.addressRepository.find({
        where: { userId },
        relations: ['region', 'user'],
      });
    }
    throw new NotFoundException('No addresses found for this user');
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
