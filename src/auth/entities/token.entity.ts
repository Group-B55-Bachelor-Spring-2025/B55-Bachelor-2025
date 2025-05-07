// src/auth/entities/token.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'token_hash', unique: true, length: 64 })
  tokenHash!: string;

  @Column({ type: 'enum', enum: TokenType })
  type!: TokenType;

  @Column({ name: 'is_revoked', default: false })
  isRevoked!: boolean;

  @Column({ name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
