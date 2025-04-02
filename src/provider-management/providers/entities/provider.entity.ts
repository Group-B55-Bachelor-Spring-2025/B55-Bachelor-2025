import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProviderCredential } from '../../provider-credentials/entities/provider-credential.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'api_base_url', length: 255, nullable: true })
  apiBaseUrl!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(
    () => ProviderCredential,
    (providerCredential) => providerCredential.provider,
  )
  credentials!: ProviderCredential[];
}
