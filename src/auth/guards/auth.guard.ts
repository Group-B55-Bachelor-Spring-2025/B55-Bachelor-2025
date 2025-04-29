import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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

    // Access cookies safely
    const accessToken = request.cookies?.['accessToken'] as string | undefined;

    try {
      // Verify token
      if (!accessToken) {
        response.redirect('/login');
        return false;
      }
      const payload = await this.tokensService.verifyToken(
        accessToken,
        TokenType.ACCESS,
      );

      if (!payload) {
        response.redirect('/login');
        return false;
      }

      const _decoded = this.tokensService.decodedToken(accessToken);

      // Create the user object
      const user = {
        id: _decoded.sub,
        email: _decoded.email,
        role: _decoded.role as Role,
        name: _decoded.name,
      };

      // Assign to request.user instead of payload.user
      request.user = user;

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      response.redirect('/login');
      return false;
    }
  }
}
