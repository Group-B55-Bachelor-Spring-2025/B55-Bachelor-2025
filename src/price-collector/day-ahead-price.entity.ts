import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('day_ahead_price')
export class DayAheadPrice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  position!: number;

  @Column('float')
  price!: number;

  @Column()
  zone!: string;

  @CreateDateColumn()
  fetchedAt!: Date;
}
