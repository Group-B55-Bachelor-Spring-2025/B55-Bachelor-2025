import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SmartControlSettingsService } from './smart-control-settings.service';
import { CreateSmartControlSettingDto } from './dto/create-smart-control-setting.dto';
import { UpdateSmartControlSettingDto } from './dto/update-smart-control-setting.dto';

@Controller('smart-control-settings')
export class SmartControlSettingsController {
  constructor(private readonly smartControlSettingsService: SmartControlSettingsService) {}

  @Post()
  create(@Body() createSmartControlSettingDto: CreateSmartControlSettingDto) {
    return this.smartControlSettingsService.create(createSmartControlSettingDto);
  }

  @Get()
  findAll() {
    return this.smartControlSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smartControlSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmartControlSettingDto: UpdateSmartControlSettingDto) {
    return this.smartControlSettingsService.update(+id, updateSmartControlSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smartControlSettingsService.remove(+id);
  }
}
