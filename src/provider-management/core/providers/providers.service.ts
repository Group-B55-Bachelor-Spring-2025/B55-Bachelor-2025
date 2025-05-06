import { IProviderService } from '../../interfaces/provider.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { MillService } from '@app/provider-management/adapters/mill/mill.service';
import { ProviderCredentialsService } from '../credentials/provider-credentials.service';

@Injectable()
export class ProvidersService implements IProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly millService: MillService,
    private readonly providerCredentialService: ProviderCredentialsService,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const provider = this.providerRepository.create(createProviderDto);
    return this.providerRepository.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return await this.providerRepository.find();
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.providerRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    return provider;
  }

  async update(
    id: number,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    await this.providerRepository.update(id, updateProviderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const provider = await this.findOne(id);
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    await this.providerRepository.delete(id);
  }

  async fetchProviderDevices(id: number, userId: number): Promise<unknown> {
    const provider = await this.findOne(id);
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    switch (provider.name) {
      case 'mill': {
        const devices = await this.millService.getAllDevices(provider, userId);
        return devices;
      }
      default:
        throw new NotFoundException(
          `Provider ${provider.name} is not supported for importing devices`,
        );
    }
  }
}
