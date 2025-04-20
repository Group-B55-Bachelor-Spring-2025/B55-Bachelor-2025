import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';

@Entity('regions')
export class Region {
  @PrimaryColumn({ name: 'code', length: 10 })
  code!: string;

  @Column({ name: 'country_code', length: 2 })
  countryCode!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'eic_code', length: 20, unique: true })
  eicCode!: string;

  @Column({ type: 'bool', nullable: true })
  active!: boolean;

  @OneToMany(() => Address, (address) => address.region)
  addresses!: Address[];
}
