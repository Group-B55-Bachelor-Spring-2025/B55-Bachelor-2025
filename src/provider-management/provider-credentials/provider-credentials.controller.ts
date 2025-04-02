import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { UpdateProviderCredentialDto } from './dto/update-provider-credential.dto';

@Controller('provider-credentials')
export class ProviderCredentialsController {
  constructor(private readonly providerCredentialsService: ProviderCredentialsService) {}

  @Post()
  create(@Body() createProviderCredentialDto: CreateProviderCredentialDto) {
    return this.providerCredentialsService.create(createProviderCredentialDto);
  }

  @Get()
  findAll() {
    return this.providerCredentialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providerCredentialsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProviderCredentialDto: UpdateProviderCredentialDto) {
    return this.providerCredentialsService.update(+id, updateProviderCredentialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerCredentialsService.remove(+id);
  }
}
