import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module'
import { OTPModule } from './modules/otp/otp.module';
import { ListingModule } from './modules/listings/listing.module';
@Module({
  imports: [PrismaModule, DogsModule, OTPModule, ListingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
