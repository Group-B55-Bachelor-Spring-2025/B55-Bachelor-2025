import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderCredentialDto } from './create-provider-credential.dto';

export class UpdateProviderCredentialDto extends PartialType(
  CreateProviderCredentialDto,
) {}
