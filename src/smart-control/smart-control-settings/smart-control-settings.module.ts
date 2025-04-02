import { Module } from '@nestjs/common';
import { SmartControlSettingsService } from './smart-control-settings.service';
import { SmartControlSettingsController } from './smart-control-settings.controller';

@Module({
  controllers: [SmartControlSettingsController],
  providers: [SmartControlSettingsService],
})
export class SmartControlSettingsModule {}
