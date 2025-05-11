import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Extended Request interface with session property
interface Request extends ExpressRequest {
  session?: {
    returnTo?: string;
    [key: string]: any;
  };
  user?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokensService: TokensService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = request.cookies?.['accessToken'] as string | undefined;
    const refreshToken = request.cookies?.['refreshToken'] as
      | string
      | undefined;

    // Save the originally requested URL for redirecting back after auth
    if (request.originalUrl) {
      request.session = request.session || {};
      request.session.returnTo = request.originalUrl;
    }

    if (!accessToken) {
      response.redirect('/login');
      return false;
    }

    try {
      // Verify the JWT signature and expiration
      const decoded = this.jwtService.verify(accessToken);
      // Verify token exists in database and is not revoked
      const tokenValid = await this.tokensService.verifyToken(
        accessToken,
        TokenType.ACCESS,
      );

      if (!tokenValid) {
        throw new Error('Token has been revoked');
      }

      const user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      };

      request.user = user;
      return true;
    } catch (jwtError) {
      if (refreshToken) {
        response.redirect('/auth/refresh');
        return false;
      } else {
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');

        response.redirect('/login');
        return false;
      }
    }
  }
}
