import { Module } from '@nestjs/common';
import { BugReportController } from './bug-report.controller';
import { BugReportService } from './bug-report.service';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [BugReportController],
  providers: [BugReportService, PrismaService, MailService],
})
export class BugReportModule {}
