import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { IAuthService } from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/auth.types';
import { TokensService } from './tokens/tokens.service';
import { TokenType } from './entities/token.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokensService: TokensService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    await this.usersService.create({
      ...registerDto,
      role: Role.USER,
    });

    return this.login(registerDto);
  }

  async login(loginDto: LoginDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password exists
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the token is valid in JWT terms
      const payload: JwtPayload = await this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      // Verify the token exists in the database and is not revoked
      const tokenRecord = await this.tokensService.verifyToken(
        refreshToken,
        TokenType.REFRESH,
      );

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke the used refresh token (optional, for added security)
      await this.tokensService.revokeToken(refreshToken);

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid token';
      throw new UnauthorizedException(`Invalid refresh token: ${errorMessage}`);
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    const decoded = this.decodedToken(token);
    const userId = decoded?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (token) {
      await this.tokensService.revokeToken(token);
    } else {
      await this.tokensService.revokeAllUserTokens(user.id);
    }

    return { success: true };
  }

  private decodedToken(token: string): JwtPayload {
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

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
    });

    // Calculate token expiry dates
    const accessTokenExpiry = new Date();
    accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + 60); // 1 hour

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Store tokens in database
    await this.tokensService.saveToken(
      user.id,
      accessToken,
      TokenType.ACCESS,
      accessTokenExpiry,
    );

    await this.tokensService.saveToken(
      user.id,
      refreshToken,
      TokenType.REFRESH,
      refreshTokenExpiry,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
