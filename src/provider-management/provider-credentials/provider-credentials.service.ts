import { Injectable } from '@nestjs/common';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { UpdateProviderCredentialDto } from './dto/update-provider-credential.dto';

@Injectable()
export class ProviderCredentialsService {
  create(createProviderCredentialDto: CreateProviderCredentialDto) {
    return 'This action adds a new providerCredential';
  }

  findAll() {
    return `This action returns all providerCredentials`;
  }

  findOne(id: number) {
    return `This action returns a #${id} providerCredential`;
  }

  update(id: number, updateProviderCredentialDto: UpdateProviderCredentialDto) {
    return `This action updates a #${id} providerCredential`;
  }

  remove(id: number) {
    return `This action removes a #${id} providerCredential`;
  }
}
