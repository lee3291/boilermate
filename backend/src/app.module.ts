import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
<<<<<<< HEAD
import { DogsModule } from '@modules/dogs/dogs.module'
import { OTPModule } from './modules/otp/otp.module';
import { ListingModule } from './modules/listings/listing.module'
=======
import { ListingsModule } from '@modules/listings/listings.module'
// import { DogsModule } from '@modules/dogs/dogs.module';
>>>>>>> origin/main
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';

@Module({
<<<<<<< HEAD
  imports: [PrismaModule, DogsModule, AuthModule, EmailVerificationModule,  OTPModule, ListingModule],
=======
  imports: [PrismaModule, ListingsModule, AuthModule, EmailVerificationModule],
>>>>>>> origin/main
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
