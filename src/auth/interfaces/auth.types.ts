import { Role } from '@app/users/enums/role.enum';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}
export interface TokenPayload {
  sub: number;
  email: string;
  role: Role;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
