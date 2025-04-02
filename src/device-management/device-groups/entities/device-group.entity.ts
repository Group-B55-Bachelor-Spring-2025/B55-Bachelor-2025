import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from '../../../location-management/addresses/entities/address.entity';
import { Device } from '../../devices/entities/device.entity';
import { SmartControlSetting } from '../../../smart-control/smart-control-settings/entities/smart-control-setting.entity';

@Entity('device_groups')
export class DeviceGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'address_id' })
  addressId!: number;

  @Column({ length: 100 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'address_id' })
  address!: Address;

  @OneToMany(() => Device, (device) => device.deviceGroup)
  devices!: Device[];

  @OneToMany(
    () => SmartControlSetting,
    (smartControlSetting) => smartControlSetting.deviceGroup,
  )
  smartControlSettings!: SmartControlSetting[];
}
