import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Render,
} from '@nestjs/common';
import { DeviceGroupsService } from './device-groups.service';
import { CreateDeviceGroupDto } from './dto/create-device-group.dto';
import { UpdateDeviceGroupDto } from './dto/update-device-group.dto';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/users/enums/role.enum';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { User } from '@app/users/entities/user.entity';
import { ProvidersService } from '@app/provider-management/core/providers/providers.service';

@Controller('device-groups')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class DeviceGroupsController {
  constructor(
    private readonly deviceGroupsService: DeviceGroupsService,
    private readonly providersService: ProvidersService,
  ) {}

  @Post()
  async create(@Body() createDeviceGroupDto: CreateDeviceGroupDto) {
    return await this.deviceGroupsService.create(createDeviceGroupDto);
  }

  @Get()
  async findAll() {
    return await this.deviceGroupsService.findAll();
  }

  @Get(':id')
  @Render('pages/devices/device-group')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const deviceGroup = await this.deviceGroupsService.findOneForUser(
      user.id,
      +id,
    );

    const providers = await this.providersService.findAll();
    return {
      providers,
      deviceGroup,
      title: 'Device Group Details',
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceGroupDto: UpdateDeviceGroupDto,
  ) {
    return await this.deviceGroupsService.update(+id, updateDeviceGroupDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.deviceGroupsService.remove(+id);
  }
}
