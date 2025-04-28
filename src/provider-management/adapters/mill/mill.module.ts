import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MillService } from './mill.service';

@Module({
  imports: [HttpModule],
  providers: [MillService],
  exports: [MillService],
})
export class MillModule {}
