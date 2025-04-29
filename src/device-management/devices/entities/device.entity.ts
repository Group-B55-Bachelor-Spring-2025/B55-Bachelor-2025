import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceGroup } from '../../device-groups/entities/device-group.entity';
import { ProviderCredential } from 'src/provider-management/core/credentials/entities/provider-credential.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ name: 'device_group_id', nullable: true })
  deviceGroupId!: number;

  @Column({ name: 'provider_credentials_id', nullable: true })
  providerCredentialsId!: number;

  @Column({ type: 'text', nullable: true })
  settings!: string;

  @Column({ name: 'external_ref', length: 100 })
  externalRef!: string;

  @Column({ length: 50, nullable: true })
  status!: string;

  @Column({ name: 'last_sync', nullable: true })
  lastSync!: Date;

  @Column({ name: 'exclude_smart_ctrl', default: false })
  excludeSmartCtrl!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => DeviceGroup, (deviceGroup) => deviceGroup.devices)
  @JoinColumn({ name: 'device_group_id' })
  deviceGroup!: DeviceGroup;

  @ManyToOne(
    () => ProviderCredential,
    (providerCredential) => providerCredential.devices,
  )
  @JoinColumn({ name: 'provider_credentials_id' })
  providerCredential!: ProviderCredential;
}
