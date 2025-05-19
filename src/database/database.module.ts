import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Keep this to inject ConfigService
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PGHOST') || config.get<string>('DB_HOST'),
        port: parseInt(
          config.get<string>('PGPORT') ||
            config.get<string>('DB_PORT') ||
            '5432',
          10,
        ),
        username: config.get<string>('PGUSER') || config.get<string>('DB_USER'),
        password:
          config.get<string>('PGPASSWORD') || config.get<string>('DB_PASS'),
        database:
          config.get<string>('PGDATABASE') || config.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        migrationsRun: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
