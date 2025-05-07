import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { MillModule } from '@app/provider-management/adapters/mill/mill.module';
import { ProviderCredentialsModule } from '../credentials/provider-credentials.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider]),
    MillModule,
    ProviderCredentialsModule,
    AuthModule,
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
