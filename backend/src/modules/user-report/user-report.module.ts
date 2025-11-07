import { Module } from '@nestjs/common';
import { UserReportController } from './user-report.controller';
import { UserReportService } from './user-report.service';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [UserReportController],
  providers: [UserReportService, PrismaService, MailService],
})
export class UserReportModule {}
