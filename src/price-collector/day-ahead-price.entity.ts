import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('day_ahead_price')
export class DayAheadPrice {
  @PrimaryColumn()
  zone!: string;

  @PrimaryColumn({ type: 'date' })
  date!: Date;

  @Column('float', { array: true })
  prices!: number[];

  @CreateDateColumn()
  fetchedAt!: Date;
}
