import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    try {
      Logger.log('Attempting to connect to database...');
      await this.$connect();
      Logger.log('PrismaClient connected successfully');
    } catch (error) {
      Logger.error('Failed to connect to database:', error);
      // Crash the app if we can't connect to DB
      process.exit(1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
