import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderAuthDto } from './dto/provider-auth.dto';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/users/enums/role.enum';
import { User } from '@app/users/entities/user.entity';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';

@Controller('provider-credentials')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class ProviderCredentialsController {
  constructor(
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  @Post(':providerId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('providerId') providerId: string,
    @Body() providerAuthDto: ProviderAuthDto,
    @CurrentUser() user: User,
  ) {
    return await this.providerCredentialsService.authenticate(
      +providerId,
      providerAuthDto,
      user.id,
    );
  }

  @Get('provider/:providerId/user')
  async getForCurrentUser(
    @Param('providerId') providerId: string,
    @CurrentUser() user: User,
  ) {
    const credential = await this.providerCredentialsService.findOneByUserId(
      +providerId,
      user.id,
    );

    if (!credential) {
      throw new NotFoundException(
        `No credentials found for this provider and user`,
      );
    }

    return credential;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerCredentialsService.remove(+id);
  }
}
