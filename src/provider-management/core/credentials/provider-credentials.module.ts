import { Module } from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderCredentialsController } from './provider-credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderCredential } from './entities/provider-credential.entity';
import { Provider } from '../providers/entities/provider.entity';
import { MillModule } from '../../adapters/mill/mill.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderCredential, Provider]),
    HttpModule,
    MillModule,
  ],
  controllers: [ProviderCredentialsController],
  providers: [ProviderCredentialsService],
  exports: [ProviderCredentialsService],
})
export class ProviderCredentialsModule {}
