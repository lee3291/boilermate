import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { OTPModule } from './modules/otp/otp.module';
import { ListingModule } from './modules/listings/listing.module';

@Module({
  imports: [PrismaModule, OTPModule, ListingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
