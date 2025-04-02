import { Injectable } from '@nestjs/common';
import { CreateSmartControlSettingDto } from './dto/create-smart-control-setting.dto';
import { UpdateSmartControlSettingDto } from './dto/update-smart-control-setting.dto';

@Injectable()
export class SmartControlSettingsService {
  create(createSmartControlSettingDto: CreateSmartControlSettingDto) {
    return 'This action adds a new smartControlSetting';
  }

  findAll() {
    return `This action returns all smartControlSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} smartControlSetting`;
  }

  update(id: number, updateSmartControlSettingDto: UpdateSmartControlSettingDto) {
    return `This action updates a #${id} smartControlSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} smartControlSetting`;
  }
}
