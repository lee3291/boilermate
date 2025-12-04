// Updated EmailService.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '../mail/mail.service';
import { SendEmailDto } from './dto/email.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getLogs() {
    return this.prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
    });
  }

  async sendEmail(dto: SendEmailDto): Promise<{ message: string }> {
  try {
    let recipients: string[] = [];

    if (dto.toEmail) {
      // Direct email
      recipients.push(dto.toEmail);
    } else if (dto.group) {
      // Email by group (ACTIVE / SUSPENDED / VERIFIED)
      const GROUP_TO_ENUM: Record<string, UserStatus> = {
        ACTIVE: UserStatus.ACTIVE,
        SUSPENDED: UserStatus.SUSPENDED,
        VERIFIED: UserStatus.ACTIVE, // Adjust if VERIFIED is a flag for verified ACTIVE users
      };

      const statusEnum = GROUP_TO_ENUM[dto.group.toUpperCase()];
      if (!statusEnum) {
        throw new InternalServerErrorException('Invalid user group.');
      }

      const users = await this.prisma.user.findMany({
        where: { status: statusEnum },
        select: { id: true }, // Use ID to build email
      });

      recipients = users.map((u) => `${u.id}@purdue.edu`);
    }

    if (recipients.length === 0) {
      throw new InternalServerErrorException('No recipients found.');
    }

    for (const email of recipients) {
      try {
        await this.mailService.sendEmail(email, dto.title, dto.message);
      } catch (err) {
        this.logger.warn(`Failed to send email to ${email}: ${err.message}`);
      }
    }

    await this.prisma.emailLog.create({
      data: {
        title: dto.title,
        message: dto.message,
        group: dto.group || null,
        toEmail: dto.toEmail || null,
      },
    });

    return { message: 'Email sent successfully.' };
  } catch (err) {
    this.logger.error(err);
    throw new InternalServerErrorException('Failed to send email.');
  }
}

}
