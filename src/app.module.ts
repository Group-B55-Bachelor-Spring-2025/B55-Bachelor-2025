import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressesModule } from './addresses/addresses.module';
import { DatabaseModule } from './database/database.module';
import { LocationManagementModule } from './location-management/location-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AddressesModule,
    LocationManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
