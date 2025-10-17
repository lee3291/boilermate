import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/database/prisma.module';
import { ChatsModule } from '@modules/chats/chats.module';

import { BugReportModule } from './modules/bug-report/bug-report.module';
import { OTPModule } from './modules/otp/otp.module';

import { AuthModule } from './modules/auth/auth.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      envFilePath: '.env', // Load environment variables
    }),
    PrismaModule, // Database module
    ChatsModule, // Chat feature module
    AuthModule,
    EmailVerificationModule,
    OTPModule,
    BugReportModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
