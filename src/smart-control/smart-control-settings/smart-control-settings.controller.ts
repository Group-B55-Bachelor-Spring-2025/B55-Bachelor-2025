import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  UseGuards,
} from '@nestjs/common';
import { SmartControlSettingsService } from './smart-control-settings.service';
import { CreateSmartControlSettingDto } from './dto/create-smart-control-setting.dto';
import { UpdateSmartControlSettingDto } from './dto/update-smart-control-setting.dto';
import { AuthGuard } from '@app/auth/guards/auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/users/enums/role.enum';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { User } from '@app/users/entities/user.entity';

@Controller('smart-control-settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class SmartControlSettingsController {
  constructor(
    private readonly smartControlSettingsService: SmartControlSettingsService,
  ) {}

  @Post()
  create(@Body() createSmartControlSettingDto: CreateSmartControlSettingDto) {
    return this.smartControlSettingsService.create(
      createSmartControlSettingDto,
    );
  }

  @Get()
  findAll() {
    return this.smartControlSettingsService.findAll();
  }

  @Get('view/:id')
  @Render('pages/smart-control/settings')
  async renderView(@Param('id') id: string, @CurrentUser() user: User) {
    const setting = await this.smartControlSettingsService.findOne(
      +id,
      user.id,
    );
    return {
      title: 'Smart Control Settings',
      setting,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.smartControlSettingsService.findOne(+id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSmartControlSettingDto: UpdateSmartControlSettingDto,
    @CurrentUser() user: User,
  ) {
    try {
      const updatedSetting = await this.smartControlSettingsService.update(
        +id,
        updateSmartControlSettingDto,
        user.id,
      );

      return {
        success: true,
        data: updatedSetting,
        message: 'Smart control settings updated successfully',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: errorMsg || 'Failed to update settings',
      };
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.smartControlSettingsService.remove(+id, user.id);
  }
}
