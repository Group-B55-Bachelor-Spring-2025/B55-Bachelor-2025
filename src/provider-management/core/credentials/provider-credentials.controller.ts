import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerCredentialsService.remove(+id);
  }
}
