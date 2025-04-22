export interface ProviderProps {
  id?: number;
  name: string;
  apiBaseUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProviderService {
  findAll(): Promise<ProviderProps[]>;
  findOne(id: number): Promise<ProviderProps | null>;
  create(provider: ProviderProps): Promise<ProviderProps>;
  update(id: number, provider: ProviderProps): Promise<ProviderProps>;
  remove(id: number): Promise<void>;
}
