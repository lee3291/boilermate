// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  // --- ROUTE DUMP (Express only) ---
  const httpAdapter = app.getHttpAdapter();
  const instance: any = httpAdapter.getInstance?.();
  const stack = instance?._router?.stack ?? [];
  console.log('--- ROUTES ---');
  stack
    .filter((l: any) => l.route)
    .forEach((l: any) => {
      const path = l.route.path;
      const methods = Object.keys(l.route.methods)
        .filter((m) => l.route.methods[m])
        .map((m) => m.toUpperCase())
        .join(', ');
      console.log(`${methods.padEnd(12)} ${path}`);
    });
  console.log('--------------');
}

bootstrap();

