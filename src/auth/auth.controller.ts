import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request as NestRequest,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './interfaces/auth.types';
import { AuthGuard } from './guards/auth.guard';
import { Public } from './decorators/public.decorator';
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.register(registerDto);
      this.setAuthCookies(res, accessToken, refreshToken);

      return res.redirect('/');
    } catch (error) {
      this.logger.error('Registration error:', error);
      return res.redirect('/register');
    }
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginDto);

      this.setAuthCookies(res, accessToken, refreshToken);
      return res.redirect('/');
    } catch (error) {
      this.logger.error('Login error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return res.render('pages/auth/login', {
        title: 'Login',
        layout: 'layouts/auth-layout',
        error: errorMsg,
      });
    }
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Res() res: Response,
    @NestRequest() req: Request & { session?: { returnTo?: string } },
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.redirect('/login');
    }

    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      const redirectUrl = req.session?.returnTo || '/';
      delete req.session?.returnTo;

      return res.redirect(redirectUrl);
    } catch (error) {
      // Clear cookies on error
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.redirect('/login');
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@NestRequest() req: RequestWithUser) {
    return req.user;
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  async logout(@NestRequest() req: Request, @Res() res: Response) {
    const accessToken = req.cookies?.['accessToken'] as string | undefined;
    if (accessToken) {
      try {
        await this.authService.logout(accessToken);
      } catch (error) {
        this.logger.error('Error during logout:', error);
      }
    }

    // Always clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.redirect('/login');
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });
  }
}
