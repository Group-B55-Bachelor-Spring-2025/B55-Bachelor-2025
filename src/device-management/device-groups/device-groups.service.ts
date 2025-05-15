import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateDeviceGroupDto } from './dto/create-device-group.dto';
import { UpdateDeviceGroupDto } from './dto/update-device-group.dto';
import { DeviceGroup } from './entities/device-group.entity';
import { AddressesService } from '@app/location-management/addresses/addresses.service';
import { Role } from '@app/users/enums/role.enum';
import { SmartControlSettingsService } from '@app/smart-control/smart-control-settings/smart-control-settings.service';

@Injectable()
export class DeviceGroupsService {
  constructor(
    @InjectRepository(DeviceGroup)
    private deviceGroupsRepository: Repository<DeviceGroup>,
    private addressService: AddressesService,
    private smartControlSettingsService: SmartControlSettingsService,
  ) {}

  async create(
    createDeviceGroupDto: CreateDeviceGroupDto,
  ): Promise<DeviceGroup> {
    const address = await this.addressService.findOne(
      createDeviceGroupDto.addressId,
    );

    if (!address) {
      throw new BadRequestException(
        'Invalid addressId: Address does not exist',
      );
    }

    const deviceGroup =
      this.deviceGroupsRepository.create(createDeviceGroupDto);
    const savedDeviceGroup =
      await this.deviceGroupsRepository.save(deviceGroup);

    // Create default smart control settings for this device group
    await this.smartControlSettingsService.createDefaultForDeviceGroup(
      savedDeviceGroup.id,
    );

    return savedDeviceGroup;
  }

  async findAll(): Promise<DeviceGroup[]> {
    return await this.deviceGroupsRepository.find({
      relations: ['address', 'devices'],
    });
  }

  async findByAddressId(addressId: number): Promise<DeviceGroup[]> {
    return await this.deviceGroupsRepository.find({
      where: { addressId },
      relations: ['devices'],
    });
  }

  async findOne(id: number): Promise<DeviceGroup | null> {
    return await this.deviceGroupsRepository.findOne({
      where: { id },
      relations: ['address', 'devices'],
    });
  }

  async update(
    id: number,
    updateDeviceGroupDto: UpdateDeviceGroupDto,
  ): Promise<DeviceGroup | null> {
    await this.deviceGroupsRepository.update(id, updateDeviceGroupDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.deviceGroupsRepository.delete(id);
  }

  async findOneForUser(
    userId: number,
    id: number,
  ): Promise<DeviceGroup | null> {
    const deviceGroup = await this.deviceGroupsRepository.findOne({
      where: { id },
      relations: ['address', 'devices'],
    });

    if (!deviceGroup) {
      throw new BadRequestException('Device group not found');
    }

    const address = await this.addressService.findOne(deviceGroup.addressId);

    if (!address || address.userId !== userId) {
      throw new ForbiddenException('Address does not belong to user');
    }

    return deviceGroup;
  }

  async findAllForUser(role: Role, userId: number): Promise<DeviceGroup[]> {
    // Get all addresses that belong to the user
    const userAddresses = await this.addressService.findAll(role, userId);

    if (userAddresses && userAddresses.length === 0) {
      return [];
    }

    const addressIds = userAddresses.map((address) => address.id);

    return this.deviceGroupsRepository.find({
      where: {
        addressId: In(addressIds),
      },
      relations: ['address', 'devices'],
    });
  }

  async findAllSmartControlEnabled(): Promise<DeviceGroup[]> {
    return await this.deviceGroupsRepository
      .createQueryBuilder('deviceGroup')
      .leftJoinAndSelect('deviceGroup.address', 'address')
      .leftJoinAndSelect('deviceGroup.devices', 'devices')
      .leftJoinAndSelect(
        'deviceGroup.smartControlSettings',
        'smartControlSettings',
      )
      .where('smartControlSettings.enabled = :enabled', { enabled: true })
      .getMany();
  }
}
