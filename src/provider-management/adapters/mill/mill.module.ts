import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MillService } from './mill.service';
import { ProviderCredentialsModule } from '../../core/credentials/provider-credentials.module';

@Module({
  imports: [HttpModule, forwardRef(() => ProviderCredentialsModule)],
  providers: [MillService],
  exports: [MillService],
})
export class MillModule {}
