import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfigInit } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

const { PORT, COOKIE_SECRET } = process.env;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      'https://youtaab.shirazidev.ir',
      'https://api-youtaab.shirazidev.ir',
      'https://admin-youtaab.shirazidev.ir',
      'https://api.menu.baniantourism.com',
      'https://menu.baniantourism.com',
      'https://www.menu.baniantourism.com',
      'https://admin.menu.baniantourism.com',
      'https://admin.rose.baniantourism.com',
      'https://rose.baniantourism.com',
      'https://api.rose.baniantourism.com',
    ],
    credentials: true,
  });
  app.use(cookieParser(COOKIE_SECRET));
  app.useStaticAssets('public');
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  SwaggerConfigInit(app);
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`app running on port ${PORT}: http://localhost:${PORT}`);
    console.log(`swagger running on url: http://localhost:${PORT}/swagger`);
  });
}

bootstrap();
