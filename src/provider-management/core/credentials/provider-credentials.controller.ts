import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderAuthDto } from './dto/provider-auth.dto';

@Controller('provider-credentials')
export class ProviderCredentialsController {
  constructor(
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  @Post(':providerId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('providerId') providerId: string,
    @Body() providerAuthDto: ProviderAuthDto,
  ) {
    return await this.providerCredentialsService.authenticate(
      +providerId,
      providerAuthDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerCredentialsService.remove(+id);
  }
}
