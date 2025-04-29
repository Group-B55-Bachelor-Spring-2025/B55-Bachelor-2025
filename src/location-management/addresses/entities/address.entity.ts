import { User } from '@app/users/entities/user.entity';
import { Region } from 'src/location-management/regions/entities/region.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 200 })
  address!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ name: 'zip_code', length: 20 })
  zipCode!: string;

  @Column({ length: 100 })
  country!: string;

  @Column({ name: 'region_code', length: 10 })
  regionCode!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'region_code', referencedColumnName: 'code' })
  region!: Region;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
