import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { OTPModule } from './modules/otp/otp.module';
import { ListingsModule } from './modules/listings/listings.module';

@Module({
  imports: [PrismaModule, OTPModule, ListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
