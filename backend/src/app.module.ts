import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { DogsModule } from '@modules/dogs/dogs.module';
import { BugReportModule } from './modules/bug-report/bug-report.module';

@Module({
  imports: [PrismaModule, DogsModule, BugReportModule],
import { DogsModule } from '@modules/dogs/dogs.module'
import { OTPModule } from './modules/otp/otp.module';
import { ListingModule } from './modules/listings/listing.module'
import { ListingsModule } from '@modules/listings/listings.module'
// import { DogsModule } from '@modules/dogs/dogs.module';
import { ListingsModule } from '@modules/listings/listings.module'
// import { DogsModule } from '@modules/dogs/dogs.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';

@Module({
  imports: [PrismaModule, ListingsModule, DogsModule, AuthModule, EmailVerificationModule,  OTPModule, ListingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}