import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    try {
      Logger.log('Attempting to connect to database...');
      
      // Sanity check for new dotenv cli setup, should be removed later
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (dbUrl) {
        Logger.log(`Database: ${dbUrl}`);
      }

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
