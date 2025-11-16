import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
// import { PrismaModule } from '@core/database/prisma.module';

@Module({
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
