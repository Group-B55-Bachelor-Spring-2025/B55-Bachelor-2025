import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../entities/token.entity';
import { Role } from '@app/users/enums/role.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    // Determine if this is an API request
    const isApiRequest =
      request.headers['accept']?.includes('application/json') ||
      request.headers['x-requested-with'] === 'XMLHttpRequest';

    // Try to get token from different sources
    let accessToken: string | undefined;

    // 1. Check cookies first
    accessToken = request.cookies?.['accessToken'] as string | undefined;

    // 2. If not in cookies and it's an API request, check Authorization header
    if (!accessToken && isApiRequest) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    try {
      // If no token found at all
      if (!accessToken) {
        if (isApiRequest) {
          throw new UnauthorizedException('Authentication required');
        } else {
          response.redirect('/login');
          return false;
        }
      }

      // Verify token
      const payload = await this.tokensService.verifyToken(
        accessToken,
        TokenType.ACCESS,
      );

      if (!payload) {
        if (isApiRequest) {
          throw new UnauthorizedException('Invalid token');
        } else {
          response.redirect('/login');
          return false;
        }
      }

      const _decoded = this.tokensService.decodedToken(accessToken);

      // Create the user object
      const user = {
        id: _decoded.sub,
        email: _decoded.email,
        role: _decoded.role as Role,
        name: _decoded.name,
      };

      request.user = user;

      return true;
    } catch (error) {
      if (isApiRequest) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new UnauthorizedException(
          `Authentication failed: ${errorMessage}`,
        );
      } else {
        // For browser clients, redirect to login
        response.redirect('/login');
        return false;
      }
    }
  }
}
