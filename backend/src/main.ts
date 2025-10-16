import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
<<<<<<< HEAD
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        methods: ['GET','POST','PUT','DELETE','OPTIONS'],
        credentials: true,
    });

    // Serve uploaded files statically
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    });

    // enable interceptor globally

    await app.listen(process.env.PORT ?? 3000);
=======
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
>>>>>>> origin/main
}
bootstrap();