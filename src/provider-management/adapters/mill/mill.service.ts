import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { Provider } from '../../core/providers/entities/provider.entity';
import { StoreCredentialsProps } from 'src/provider-management/interfaces/provider-auth.interface';

interface MillAuthResponse {
  idToken: string;
  refreshToken: string;
}

@Injectable()
export class MillService {
  private readonly logger = new Logger(MillService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Authenticates with the Mill API
   */
  async authenticate(
    provider: Provider,
    username: string,
    password: string,
  ): Promise<StoreCredentialsProps> {
    try {
      const authUrl = `${provider.apiBaseUrl}/customer/auth/sign-in`;

      const response = await firstValueFrom(
        this.httpService
          .post<MillAuthResponse>(
            authUrl,
            {
              login: username,
              password: password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            },
          )
          .pipe(
            catchError(
              (error: AxiosError<{ error?: { message?: string } }>) => {
                const message =
                  error.response?.data?.error?.message || error.message;
                this.logger.error(`Mill authentication failed: ${message}`);
                throw new UnauthorizedException(
                  `Mill authentication failed: ${message}`,
                );
              },
            ),
          ),
      );

      // Store the credentials
      const credentials: StoreCredentialsProps = {
        accessToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };
      return credentials;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Authentication error: ${errorMessage}`);
      throw error;
    }
  }
}
