import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request as NestRequest,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local/local.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestWithUser } from './interfaces/auth.types';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto);
    const { accessToken, refreshToken } = user;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      success: true,
      user: {
        id: user.user.id,
        email: user.user.email,
        role: user.user.role,
      },
      accessToken,
      refreshToken,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@NestRequest() req: RequestWithUser) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@NestRequest() req: Request, @Res() res: Response) {
    let accessToken: string | undefined;

    accessToken = req.cookies?.['accessToken'] as string | undefined;

    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (accessToken) {
      await this.authService.logout(accessToken);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    return res.json({
      success: true,
      message: 'Logout successful',
    });
  }
}
