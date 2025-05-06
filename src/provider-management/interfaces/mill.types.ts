/**
 * Types and interfaces for the Mill API integration
 */

/**
 * Authentication response from Mill API
 */
export interface MillAuthResponse {
  idToken: string;
  refreshToken: string;
}

/**
 * API client configuration
 */
export interface MillClient {
  baseUrl: string;
  headers: {
    Authorization: string;
    'Content-Type': string;
    Accept: string;
  };
}

/**
 * Basic house information
 */
export interface MillHouse {
  id: string;
  name: string;
}

/**
 * Full houses response from API
 */
export interface MillHousesResponse {
  ownHouses: Array<{
    id: string;
    name: string;
    country: string | null;
    postalCode: string;
    timezone: string;
    ownerId: string;
    mode: string;
    vacationStartDate: number;
    vacationEndDate: number;
    vacationTemperature: number;
    vacationModeType: string;
    isVacationModeActive: boolean;
    overrideModeType: string;
    overrideEndDate: number;
    roomSortType: string;
    deviceSortType: string;
    createdAt: string;
  }>;
  sharedHouses: Array<any>;
}

/**
 * Basic room information
 */
export interface MillRoom {
  id: string;
  name: string;
  houseId: string;
}

/**
 * Rooms response including independent devices
 */
export interface MillRoomsResponse {
  rooms: MillRoom[];
  independentDeviceIds: string[];
}

/**
 * Types of device categories supported by Mill
 */
export type MillDeviceCategoryType =
  | 'Heaters'
  | 'Sockets'
  | 'Air Purifiers'
  | 'Sensors';

/**
 * Standardized device information for app use
 */
export interface MillDevice {
  id: number;
  name: string;
  roomId: string;
  houseId: string;
  targetTemperature?: number;
  temperature?: number;
  mac: string;
  subDomainId: MillDeviceCategoryType;
  offline: boolean;
}

/**
 * Raw device response from the Mill API
 */
export interface MillDeviceResponse {
  deviceId: number;
  customName: string;
  roomId: string;
  houseId: string;
  macAddress: string;
  isConnected: boolean;
  lastMetrics?: {
    temperature?: number;
    temperatureAmbient?: number;
  };
  deviceType?: {
    parentType?: {
      name?: MillDeviceCategoryType;
    };
  };
}
