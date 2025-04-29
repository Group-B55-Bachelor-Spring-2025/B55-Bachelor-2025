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
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/users/enums/role.enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { User } from '@app/users/entities/user.entity';

@Controller('addresses')
@UseGuards(AuthGuard, RolesGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.USER, Role.ADMIN)
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: User,
  ): Promise<Address> {
    console.log('User:', user);
    return await this.addressesService.create(createAddressDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User): Promise<Address[]> {
    return this.addressesService.findAll(user.role, user.id);
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
