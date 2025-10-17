import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true,
  });
  
  // enable interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();