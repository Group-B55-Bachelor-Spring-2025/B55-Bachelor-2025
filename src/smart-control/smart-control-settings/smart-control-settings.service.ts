import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSmartControlSettingDto } from './dto/create-smart-control-setting.dto';
import { UpdateSmartControlSettingDto } from './dto/update-smart-control-setting.dto';
import { SmartControlSetting } from './entities/smart-control-setting.entity';

@Injectable()
export class SmartControlSettingsService {
  constructor(
    @InjectRepository(SmartControlSetting)
    private smartControlSettingsRepository: Repository<SmartControlSetting>,
  ) {}

  async create(
    createSmartControlSettingDto: CreateSmartControlSettingDto,
  ): Promise<SmartControlSetting> {
    const setting = this.smartControlSettingsRepository.create(
      createSmartControlSettingDto,
    );
    return await this.smartControlSettingsRepository.save(setting);
  }

  async createDefaultForDeviceGroup(
    deviceGroupId: number,
  ): Promise<SmartControlSetting> {
    // Create with default values
    const defaultSetting = this.smartControlSettingsRepository.create({
      deviceGroupId,
      enabled: true,
      temperatureOffset: 2,
      energySavingsPercentage: 20,
      nightShiftEnabled: false,
    });
    return await this.smartControlSettingsRepository.save(defaultSetting);
  }

  async findAll(): Promise<SmartControlSetting[]> {
    return await this.smartControlSettingsRepository.find({
      relations: ['deviceGroup'],
    });
  }

  async findByDeviceGroupId(
    deviceGroupId: number,
  ): Promise<SmartControlSetting[]> {
    return await this.smartControlSettingsRepository.find({
      where: { deviceGroupId },
    });
  }

  async findOne(id: number, userId: number): Promise<SmartControlSetting> {
    const setting = await this.smartControlSettingsRepository.findOne({
      where: { id },
      relations: ['deviceGroup', 'deviceGroup.address'],
    });

    if (!setting) {
      throw new NotFoundException(
        `Smart control setting with ID ${id} not found`,
      );
    }

    const address = setting.deviceGroup?.address;
    if (!address || address.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to access this smart control setting`,
      );
    }

    return setting;
  }

  async update(
    id: number,
    updateSmartControlSettingDto: UpdateSmartControlSettingDto,
    userId: number,
  ): Promise<SmartControlSetting> {
    const setting = await this.findOne(id, userId);

    // Update the entity with the new values
    this.smartControlSettingsRepository.merge(
      setting,
      updateSmartControlSettingDto,
    );
    return await this.smartControlSettingsRepository.save(setting);
  }

  async remove(id: number, userId: number): Promise<void> {
    const setting = await this.findOne(id, userId);
    await this.smartControlSettingsRepository.remove(setting);
  }

  async isPeakHour(
    smartControlSetting: SmartControlSetting,
    zonePrices: number[],
    date: Date,
  ): Promise<boolean> {
    const currentHour = date.getUTCHours();

    if (!smartControlSetting.enabled) {
      return false;
    }

    const peakHoursCount = Math.round(
      (smartControlSetting.energySavingsPercentage * 24) / 100,
    );

    const peakHours = zonePrices
      .map((price, index) => ({ price, index }))
      .sort((a, b) => b.price - a.price)
      .slice(0, peakHoursCount)
      .map((item) => item.index);

    if (peakHours.includes(currentHour)) {
      return true;
    }

    return false;
  }
}
