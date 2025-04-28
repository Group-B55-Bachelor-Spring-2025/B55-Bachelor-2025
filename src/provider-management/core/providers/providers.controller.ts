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
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return await this.providersService.update(+id, updateProviderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.providersService.remove(+id);
  }
}
