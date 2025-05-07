import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressLayouts from 'express-ejs-layouts';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const rootDir = process.cwd();
  const viewsPath = join(rootDir, 'views');

  const logger = new Logger('Bootstrap');
  logger.log(`Current directory: ${process.cwd()}`);
  logger.log(`Views directory: ${viewsPath}`);
  logger.log(`Views directory exists: ${fs.existsSync(viewsPath)}`);

  if (fs.existsSync(viewsPath)) {
    const addressView = join(viewsPath, 'pages', 'addresses', 'address.ejs');
    logger.log(`Address view path: ${addressView}`);
    logger.log(`Address view exists: ${fs.existsSync(addressView)}`);
  }

  app.useStaticAssets(join(rootDir, 'public'));
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('ejs');
  app.use(expressLayouts);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
