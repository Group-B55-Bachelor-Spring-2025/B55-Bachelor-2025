import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Token, TokenType } from '../entities/token.entity';
import * as crypto from 'crypto';
import { JwtPayload } from '../interfaces/auth.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
  ) {}

  // Store a new token
  async saveToken(
    userId: number,
    token: string,
    type: TokenType,
    expiresAt: Date,
  ): Promise<Token> {
    // Hash the token for security
    const tokenHash = this.hashToken(token);

    const tokenEntity = this.tokenRepository.create({
      userId,
      tokenHash,
      type,
      expiresAt,
    });

    return this.tokenRepository.save(tokenEntity);
  }

  // Verify a token is valid and not revoked
  async verifyToken(token: string, type: TokenType): Promise<Token | null> {
    const tokenHash = this.hashToken(token);

    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        tokenHash,
        type,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    return tokenEntity || null;
  }

  // Revoke a specific token
  async revokeToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const result = await this.tokenRepository.update(
      { tokenHash },
      { isRevoked: true },
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Revoke all tokens for a user
  async revokeAllUserTokens(
    userId: number,
    type?: TokenType,
  ): Promise<boolean> {
    const queryCondition: {
      userId: number;
      type?: TokenType;
    } = { userId };
    if (type) {
      queryCondition.type = type;
    }

    const result = await this.tokenRepository.update(queryCondition, {
      isRevoked: true,
    });

    return result.affected ? result.affected > 0 : false;
  }

  // Clean up expired tokens (can be run as a cron job)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.tokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  decodedToken(token: string): JwtPayload {
    try {
      const decoded: JwtPayload = this.jwtService.decode(token);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      return decoded;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid token';
      throw new UnauthorizedException(errorMessage);
    }
  }

  // Hash a token for secure storage
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
