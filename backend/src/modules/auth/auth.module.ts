import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '@core/database/prisma.module';
import { EmailVerificationModule } from '@modules/email-verification/email-verification.module';

@Module({
  imports: [PrismaModule, EmailVerificationModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
