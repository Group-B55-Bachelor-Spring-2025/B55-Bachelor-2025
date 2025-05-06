import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';
import { Role } from '@app/users/enums/role.enum';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { User } from '@app/users/entities/user.entity';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';

@Controller('providers')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.USER)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<Provider> {
    return await this.providersService.create(createProviderDto);
  }

  @Get()
  async findAll(): Promise<Provider[]> {
    return await this.providersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.providersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return await this.providersService.update(+id, updateProviderDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.providersService.remove(+id);
  }

  @Get(':id/provider-devices')
  async importDevices(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.providersService.fetchProviderDevices(+id, user.id);
  }
}
