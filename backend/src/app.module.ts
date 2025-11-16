import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { OTPModule } from './modules/otp/otp.module';
import { ListingsModule } from '@modules/listings/listings.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ChatsModule } from '@modules/chats/chats.module';
import { UploadsModule } from '@modules/uploads/uploads.module';
import { BugReportModule } from './modules/bug-report/bug-report.module';
import { UserReportModule } from './modules/user-report/user-report.module';

import { ReCaptchaModule } from '@modules/reCaptcha/reCaptcha.module';
import { PreferencesModule } from '@modules/preferences/preferences.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
// Ethan
// import { ProfileModule } from './modules/profile/profile.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      envFilePath: '.env', // Load environment variables for production/ the main db
    }),
    ScheduleModule.forRoot(),
    PrismaModule, // Database module
    ChatsModule, // Chat feature module
    UploadsModule, // Image upload module
    PreferencesModule, // Preferences module (I am.../I want...)
    ProfileModule, // Profile and roommate matching module
    AuthModule,
    EmailVerificationModule,
    OTPModule,
    ListingsModule,
    BugReportModule,
    UserReportModule,
    ReCaptchaModule,
    ProfileModule,
    VerificationModule,
    AnnouncementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
