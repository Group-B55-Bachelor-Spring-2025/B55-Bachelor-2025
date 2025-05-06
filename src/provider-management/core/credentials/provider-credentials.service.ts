import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
// import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
// import { UpdateProviderCredentialDto } from './dto/update-provider-credential.dto';
import { ProviderCredential } from './entities/provider-credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '../providers/entities/provider.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { MillService } from '../../adapters/mill/mill.service';
import {
  ProviderAuthProps,
  StoreCredentialsProps,
} from '../../interfaces/provider-auth.interface';

@Injectable()
export class ProviderCredentialsService {
  constructor(
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MillService))
    private readonly millService: MillService,
  ) {}

  async authenticate(
    providerId: number,
    authDto: ProviderAuthProps,
    userId: number,
  ): Promise<ProviderCredential | null> {
    // Find the provider
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found`);
    }

    // Get token from the provider
    switch (provider.name) {
      case 'mill': {
        const tokenResponse = await this.millService.authenticate(
          provider,
          authDto.username,
          authDto.password,
        );
        const storedCredentials = await this.storeCredentials(
          providerId,
          userId,
          tokenResponse,
        );
        return storedCredentials;
      }
      default:
        throw new NotFoundException(
          `Provider ${provider.name} is not supported for authentication`,
        );
    }
  }

  async storeCredentials(
    providerId: number,
    userId: number,
    credentials: StoreCredentialsProps,
  ): Promise<ProviderCredential> {
    // Find existing credential for this user and provider or create new one
    let credential = await this.providerCredentialRepository.findOne({
      where: { providerId, userId },
    });

    if (!credential) {
      credential = new ProviderCredential();
      credential.providerId = providerId;
      credential.userId = userId;
    }

    // Update credential properties
    credential.accessToken = credentials.accessToken;
    credential.refreshToken = credentials.refreshToken || undefined;
    credential.expiresAt = credentials.expiresAt || undefined;

    return this.providerCredentialRepository.save(credential);
  }

  findAll() {
    return `This action returns all providerCredentials`;
  }

  async findOne(id: number) {
    const credential = await this.providerCredentialRepository.findOne({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    return credential;
  }

  async findOneByUserId(providerId: number, userId: number) {
    const credential = await this.providerCredentialRepository.findOne({
      where: { providerId, userId },
    });

    return credential;
  }

  async update(id: number, updateData: Partial<ProviderCredential>) {
    const credential = await this.findOne(id);

    // Apply updates
    Object.assign(credential, updateData);

    return this.providerCredentialRepository.save(credential);
  }

  remove(id: number) {
    return `This action removes a #${id} providerCredential`;
  }
}
