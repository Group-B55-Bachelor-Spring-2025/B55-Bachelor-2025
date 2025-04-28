import { User } from '@app/users/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

/**
 * Interface defining the authentication service contract
 */
export interface IAuthService {
  /**
   * Register a new user
   * @param registerDto - User registration data
   * @returns Object containing user data and authentication tokens
   */
  register(registerDto: RegisterDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Authenticate a user and generate tokens
   * @param user - The authenticated user
   * @returns Object containing user data and authentication tokens
   */
  login(loginDto: LoginDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - User password
   * @returns Authenticated user if credentials are valid
   * @throws UnauthorizedException if credentials are invalid
   */
  validateUser(email: string, password: string): Promise<User>;

  /**
   * Generate new tokens using a refresh token
   * @param refreshToken - Valid refresh token
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid or expired
   */
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Logout a user by invalidating their tokens
   * @param token - Optional token to invalidate
   * @returns Success status
   */
  logout(token: string): Promise<{ success: boolean }>;
}
