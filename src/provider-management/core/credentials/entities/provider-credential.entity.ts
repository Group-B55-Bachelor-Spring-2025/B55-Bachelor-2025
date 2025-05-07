import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { Device } from '../../../../device-management/devices/entities/device.entity';
import { User } from '../../../../users/entities/user.entity';

@Entity('provider_credentials')
export class ProviderCredential {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'provider_id' })
  providerId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'access_token', type: 'text' })
  accessToken!: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Provider, (provider) => provider.credentials)
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Device, (device) => device.providerCredential)
  devices!: Device[];
}
