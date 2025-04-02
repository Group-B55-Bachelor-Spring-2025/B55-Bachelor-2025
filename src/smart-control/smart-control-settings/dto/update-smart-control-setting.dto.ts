import { PartialType } from '@nestjs/mapped-types';
import { CreateSmartControlSettingDto } from './create-smart-control-setting.dto';

export class UpdateSmartControlSettingDto extends PartialType(CreateSmartControlSettingDto) {}
