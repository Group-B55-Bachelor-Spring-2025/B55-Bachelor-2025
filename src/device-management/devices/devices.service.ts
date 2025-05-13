import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Repository, In } from 'typeorm';
import { DeviceGroupsService } from '../device-groups/device-groups.service';
import { Role } from '@app/users/enums/role.enum';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly deviceGroupService: DeviceGroupsService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const device = this.deviceRepository.create({
      name: createDeviceDto.name,
      type: createDeviceDto.type,
      deviceGroupId: createDeviceDto.deviceGroupId,
      providerCredentialsId: createDeviceDto.providerCredentialsId,
      settings: createDeviceDto.settings,
      externalRef: createDeviceDto.externalRef,
      status: createDeviceDto.status || 'offline',
      excludeSmartCtrl: createDeviceDto.excludeSmartCtrl || false,
    });

    return this.deviceRepository.save(device);
  }

  async findAll() {
    return this.deviceRepository.find({
      relations: ['deviceGroup'],
    });
  }

  async findAllForUser(role: Role, userId: number) {
    const userDeviceGroups = await this.deviceGroupService.findAllForUser(
      role,
      userId,
    );

    const deviceGroupIds = userDeviceGroups.map((group) => group.id);

    if (deviceGroupIds.length === 0) {
      return [];
    }

    return this.deviceRepository.find({
      where: {
        deviceGroupId: In(deviceGroupIds),
      },
      relations: ['deviceGroup'],
    });
  }

  async findOne(id: number) {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: ['deviceGroup'],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  async findAllByCredentialId(id: number): Promise<Device[]> {
    const devices = await this.deviceRepository.find({
      where: { providerCredentialsId: id },
      relations: ['deviceGroup'],
    });
    if (!devices) {
      throw new NotFoundException(`Devices with credential ID ${id} not found`);
    }
    return devices;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.findOne(id);

    // Update the device with the new values
    Object.assign(device, updateDeviceDto);

    return this.deviceRepository.save(device);
  }

  async remove(id: number) {
    const device = await this.findOne(id);
    return this.deviceRepository.remove(device);
  }
}
