import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, PrismaService, MailService],
})
export class EmailModule {}
