import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@app/users/users.service';
import { JwtPayload } from '../interfaces/auth.types';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../entities/token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private tokensService: TokensService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const extractJwtFromBearer = ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: extractJwtFromBearer,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: JwtPayload) {
    try {
      // Get the original token from the request
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      // Check if token exists
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Check if the token is valid in the database
      const isValid = await this.tokensService.verifyToken(
        token,
        TokenType.ACCESS,
      );

      if (!isValid) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(`${errorMessage}`);
    }
  }
}
