import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartControlSettingsService } from './smart-control-settings.service';
import { SmartControlSettingsController } from './smart-control-settings.controller';
import { SmartControlSetting } from './entities/smart-control-setting.entity';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SmartControlSetting]), AuthModule],
  controllers: [SmartControlSettingsController],
  providers: [SmartControlSettingsService],
  exports: [SmartControlSettingsService],
})
export class SmartControlSettingsModule {}
