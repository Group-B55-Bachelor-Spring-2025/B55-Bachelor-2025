import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/users/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @Column()
  @IsNotEmpty()
  password?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @CreateDateColumn()
  createdAt?: Date;

  @CreateDateColumn()
  updatedAt?: Date;
}
