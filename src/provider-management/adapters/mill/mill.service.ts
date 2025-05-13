import {
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, Observable } from 'rxjs';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { add } from 'date-fns';
import { Provider } from '../../core/providers/entities/provider.entity';
import { StoreCredentialsProps } from 'src/provider-management/interfaces/provider-auth.interface';
import { ProviderCredential } from '@app/provider-management/core/credentials/entities/provider-credential.entity';
import { ProviderCredentialsService } from '@app/provider-management/core/credentials/provider-credentials.service';
import {
  MillAuthResponse,
  MillDevice,
  MillDeviceResponse,
  MillHouse,
  MillHousesResponse,
  MillRoomsResponse,
} from '../../interfaces/mill.types';

/**
 * Extracts the expiration time from a JWT token
 * Falls back to a 9-minute expiration if the token doesn't contain an exp claim
 */
export const getIdTokenExpiration = (tokens: MillAuthResponse): Date | null => {
  if (tokens?.idToken) {
    const jwtPayload = jwtDecode(tokens.idToken);

    return jwtPayload?.exp
      ? new Date((jwtPayload?.exp || 0) * 1000)
      : add(new Date(), { minutes: 9 });
  }

  return null;
};

@Injectable()
export class MillService {
  private readonly logger = new Logger(MillService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => ProviderCredentialsService))
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

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

      const observable: Observable<AxiosResponse<MillAuthResponse>> =
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
          );

      const response = await firstValueFrom(observable);

      // Store the credentials
      const credentials: StoreCredentialsProps = {
        accessToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresAt: getIdTokenExpiration(response.data) || undefined,
      };
      return credentials;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Authentication error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gets credentials for the provider, refreshing if needed
   */
  async getMillCredentials(
    provider: Provider,
    userId: number,
  ): Promise<ProviderCredential> {
    try {
      const credentials = await this.providerCredentialsService.findOneByUserId(
        provider.id,
        userId,
      );

      if (!credentials) {
        throw new UnauthorizedException(
          `No credentials found for provider with ID ${provider.id} and user ID ${userId}`,
        );
      }

      if (credentials.expiresAt && credentials.expiresAt < new Date()) {
        this.logger.log('Token expired, refreshing...');
        const req = axios.create({
          baseURL: provider.apiBaseUrl,
          headers: { Authorization: `Bearer ${credentials.refreshToken}` },
        });

        const millRes = await req.post<any>('/customer/auth/refresh');

        const tokens = millRes?.data as MillAuthResponse;
        const updatedCreds = {
          accessToken: tokens.idToken || credentials.accessToken,
          refreshToken: tokens.refreshToken || credentials.refreshToken,
          expiresAt: getIdTokenExpiration(tokens) || undefined,
        };

        await this.providerCredentialsService.update(
          credentials.id,
          updatedCreds,
        );

        // Return updated credentials
        return {
          ...credentials,
          ...updatedCreds,
        };
      }

      return credentials;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get credentials error: ${errorMessage}`);
      throw error;
    }
  }

  async getMillHttpClient(
    provider: Provider,
    userId: number,
  ): Promise<AxiosInstance> {
    const credentials = await this.getMillCredentials(provider, userId);

    if (!credentials.accessToken) {
      throw new UnauthorizedException('No valid credentials');
    }

    const headers = { Authorization: `Bearer ${credentials.accessToken}` };

    return axios.create({
      baseURL: provider.apiBaseUrl,
      headers,
    });
  }

  async getHouses(
    provider: Provider,
    userId: number,
    client?: AxiosInstance,
  ): Promise<MillHouse[]> {
    try {
      const httpClient =
        client || (await this.getMillHttpClient(provider, userId));

      const res = await httpClient.get<MillHousesResponse>('/houses');

      // Extract only id and name from each house in the ownHouses array
      return res.data.ownHouses.map((house) => ({
        id: house.id,
        name: house.name,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get houses error: ${errorMessage}`);
      throw error;
    }
  }

  async getRooms(
    provider: Provider,
    userId: number,
    houseId: string,
    client?: AxiosInstance,
  ): Promise<MillRoomsResponse> {
    try {
      const httpClient =
        client || (await this.getMillHttpClient(provider, userId));

      const res = await httpClient.get<MillRoomsResponse>(
        `/houses/${houseId}/rooms`,
      );

      return {
        rooms: res.data.rooms.map((room) => ({
          id: room.id,
          name: room.name,
          houseId: room.houseId,
        })),
        independentDeviceIds: res.data.independentDeviceIds || [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get rooms error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Maps a Mill API device response to our MillDevice interface
   */
  private mapDeviceFromApiResponse = (
    millDeviceFromApi: MillDeviceResponse,
  ): MillDevice => {
    return {
      id: millDeviceFromApi.deviceId,
      name: millDeviceFromApi.customName,
      roomId: millDeviceFromApi.roomId,
      houseId: millDeviceFromApi.houseId,
      targetTemperature: millDeviceFromApi?.lastMetrics?.temperature,
      temperature: millDeviceFromApi?.lastMetrics?.temperatureAmbient,
      mac: millDeviceFromApi.macAddress,
      subDomainId: millDeviceFromApi?.deviceType?.parentType?.name || 'Heaters',
      offline: !millDeviceFromApi.isConnected,
    };
  };

  /**
   * Get devices for a specific room
   * @param provider The provider entity
   * @param userId The user ID
   * @param roomId The room ID
   * @param client Optional HTTP client instance to reuse
   * @returns Array of Mill devices
   */
  async getDevices(
    provider: Provider,
    userId: number,
    roomId: string,
    client?: AxiosInstance,
  ): Promise<MillDevice[]> {
    try {
      const httpClient =
        client || (await this.getMillHttpClient(provider, userId));

      const res = await httpClient.get<{
        devices: MillDeviceResponse[];
      }>(`/rooms/${roomId}/devices`);

      if (!res.data?.devices || !Array.isArray(res.data.devices)) {
        return [];
      }

      return res.data.devices.map((device) =>
        this.mapDeviceFromApiResponse(device),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get devices error: ${errorMessage}`);
      throw error;
    }
  }

  async getDevice(
    provider: Provider,
    userId: number,
    deviceId: string,
  ): Promise<MillDevice> {
    try {
      const client = await this.getMillHttpClient(provider, userId);

      const res = await client.get<MillDeviceResponse>(
        `/devices/${deviceId}/data`,
      );

      if (!res.data) {
        throw new Error('Device not found');
      }

      return this.mapDeviceFromApiResponse(res.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get device error: ${errorMessage}`);
      throw error;
    }
  }

  async getAllDevices(
    provider: Provider,
    userId: number,
  ): Promise<MillDevice[]> {
    try {
      const client = await this.getMillHttpClient(provider, userId);

      const houses = await this.getHouses(provider, userId, client);
      if (!houses || houses.length === 0) {
        return [];
      }

      const rooms = await Promise.all(
        houses.map((house) =>
          this.getRooms(provider, userId, house.id, client),
        ),
      );
      if (!rooms || rooms.length === 0) {
        return [];
      }

      const roomIds = rooms.flatMap((r) => r.rooms.map((room) => room.id));
      const devices = await Promise.all(
        roomIds.map((roomId) =>
          this.getDevices(provider, userId, roomId, client),
        ),
      );
      if (!devices || devices.length === 0) {
        return [];
      }
      // TODO: check the independentDevice and add them to the devices array
      return devices.flatMap((d) => d);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Mill - Get all devices error: ${errorMessage}`);
      throw error;
    }
  }
}
