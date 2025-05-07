import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/users/enums/role.enum';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { User } from '@app/users/entities/user.entity';
import { DeviceGroupsService } from '../device-groups/device-groups.service';

@Controller('devices')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceGroupsService: DeviceGroupsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    // Check if the user has permission to create a device by checking the device group and address
    // associated with the device
    if (!createDeviceDto.deviceGroupId) {
      throw new BadRequestException('Device group ID is required');
    }

    // Verify the device group exists and belongs to this user by checking associated address ownership
    await this.deviceGroupsService.findOneForUser(
      user.id,
      createDeviceDto.deviceGroupId,
    );

    return await this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    if (user.role === Role.ADMIN) {
      return this.devicesService.findAll();
    }

    return this.devicesService.findAllForUser(user.role, user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const device = await this.devicesService.findOne(+id);

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    if (user.role === Role.ADMIN) {
      return device;
    }

    // For regular users, verify device ownership
    await this.deviceGroupsService.findOneForUser(
      user.id,
      device.deviceGroupId,
    );
    return device;
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const device = await this.devicesService.findOne(+id);

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // If the user is trying to move the device to another group, verify they have access to that group
    if (
      updateDeviceDto.deviceGroupId &&
      updateDeviceDto.deviceGroupId !== device.deviceGroupId
    ) {
      await this.deviceGroupsService.findOneForUser(
        user.id,
        updateDeviceDto.deviceGroupId,
      );
    }

    // Verify the user owns the current device group
    if (user.role !== Role.ADMIN) {
      await this.deviceGroupsService.findOneForUser(
        user.id,
        device.deviceGroupId,
      );
    }

    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    // First find the device to get its deviceGroupId
    const device = await this.devicesService.findOne(+id);

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // Verify the user owns the device group
    if (user.role !== Role.ADMIN) {
      await this.deviceGroupsService.findOneForUser(
        user.id,
        device.deviceGroupId,
      );
    }

    return this.devicesService.remove(+id);
  }
}
