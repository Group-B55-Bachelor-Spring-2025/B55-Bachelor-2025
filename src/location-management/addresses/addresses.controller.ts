import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAddressDto: CreateAddressDto): Promise<Address> {
    return await this.addressesService.create(createAddressDto);
  }

  @Get()
  findAll(): Promise<Address[]> {
    return this.addressesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Address> {
    return this.addressesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    return await this.addressesService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Address> {
    return await this.addressesService.remove(+id);
  }
}
