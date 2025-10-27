import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { ReportModule } from '@modules/report/report.module';
import { PreferencesModule } from '@modules/preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      envFilePath: '.env', // Load environment variables
    }),
    PrismaModule, // Database module
    ChatsModule, // Chat feature module
    UploadsModule, // Image upload module
    PreferencesModule, // Preferences module (I am.../I want...)
    AuthModule,
    EmailVerificationModule,
    OTPModule,
    ListingsModule,
    BugReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
