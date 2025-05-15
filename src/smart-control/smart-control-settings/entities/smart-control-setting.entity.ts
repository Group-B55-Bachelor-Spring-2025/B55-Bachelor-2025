import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceGroup } from '../../../device-management/device-groups/entities/device-group.entity';

@Entity('smart_control_settings')
export class SmartControlSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'device_group_id' })
  deviceGroupId!: number;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ name: 'temperature_offset', nullable: true })
  temperatureOffset!: number;

  @Column({ name: 'energy_savings_percentage', nullable: true })
  energySavingsPercentage!: number;

  @Column({ name: 'night_shift_enabled', default: false })
  nightShiftEnabled!: boolean;

  @Column({ name: 'night_shift_start', nullable: true })
  nightShiftStart?: Date;

  @Column({ name: 'night_shift_duration', nullable: true })
  nightShiftDuration?: number;

  @Column({ name: 'night_shift_saving_percentage', nullable: true })
  nightShiftSavingPercentage?: number;

  @Column({ name: 'day_of_week', nullable: true })
  dayOfWeek?: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(
    () => DeviceGroup,
    (deviceGroup) => deviceGroup.smartControlSettings,
  )
  @JoinColumn({ name: 'device_group_id' })
  deviceGroup!: DeviceGroup;
}
