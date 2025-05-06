import { Module, forwardRef } from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderCredentialsController } from './provider-credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderCredential } from './entities/provider-credential.entity';
import { Provider } from '../providers/entities/provider.entity';
import { MillModule } from '../../adapters/mill/mill.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderCredential, Provider]),
    HttpModule,
    forwardRef(() => MillModule),
    AuthModule,
  ],
  controllers: [ProviderCredentialsController],
  providers: [ProviderCredentialsService],
  exports: [ProviderCredentialsService],
})
export class ProviderCredentialsModule {}
