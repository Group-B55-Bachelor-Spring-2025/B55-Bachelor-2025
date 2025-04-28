import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../entities/token.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    // Access cookies safely
    const accessToken = request.cookies?.['accessToken'] as string | undefined;

    if (!accessToken) {
      response.redirect('/login');
      return false;
    }

    try {
      // Verify the token
      const payload = await this.tokensService.verifyToken(
        accessToken,
        TokenType.ACCESS,
      );

      if (!payload) {
        response.redirect('/login');
        return false;
      }

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      response.redirect('/login');
      return false;
    }
  }
}
