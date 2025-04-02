import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeviceGroupsService } from './device-groups.service';
import { CreateDeviceGroupDto } from './dto/create-device-group.dto';
import { UpdateDeviceGroupDto } from './dto/update-device-group.dto';

@Controller('device-groups')
export class DeviceGroupsController {
  constructor(private readonly deviceGroupsService: DeviceGroupsService) {}

  @Post()
  create(@Body() createDeviceGroupDto: CreateDeviceGroupDto) {
    return this.deviceGroupsService.create(createDeviceGroupDto);
  }

  @Get()
  findAll() {
    return this.deviceGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceGroupDto: UpdateDeviceGroupDto) {
    return this.deviceGroupsService.update(+id, updateDeviceGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceGroupsService.remove(+id);
  }
}
