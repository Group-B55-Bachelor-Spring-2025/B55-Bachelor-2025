export interface ProviderAuthProps {
  username: string;
  password: string;
}

export interface ProviderTokenStatus {
  isValid: boolean;
  expiresAt?: Date;
}

export interface StoreCredentialsProps {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}
