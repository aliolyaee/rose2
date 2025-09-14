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

  // CORS باز تا فرانت فعلی بدون تغییر کار کند
  app.enableCors({
    origin: (origin, cb) => cb(null, true), // اجازه همه originها
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    exposedHeaders: 'x-session-id',
  });

  // میدل‌ور قطعی برای هدرها و پاسخ OPTIONS=204
  app.use((req, res, next) => {
    const origin = (req.headers.origin as string) || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, *');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
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
