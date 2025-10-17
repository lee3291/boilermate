import { PrismaService } from '@core/database/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { addMinutes, isBefore } from 'date-fns';
import { randomInt } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(private prisma: PrismaService) {}

  // Generate or overwrite a verification code for a given email.
  async createVerification(email: string) {
    if (!email.endsWith('@purdue.edu')) {
      throw new BadRequestException('Only Purdue emails are allowed.');
    }

    const code = randomInt(100000, 999999).toString();
    const expiresAt = addMinutes(new Date(), 10);

    await this.prisma.emailVerification.upsert({
      where: { email },
      update: { code, expiresAt, verifiedAt: null, createdAt: new Date() },
      create: { email, code, expiresAt },
    });

    // TODO: integrate email sending service later
    console.log(`[DEBUG] Verification Code for ${email}: ${code}`);

    return { message: 'Verification code sent successfully.' };
  }

  async verifyCode(email: string, code: string) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { email },
    });
    if (!record) throw new NotFoundException('No verification record found.');
    if (record.verifiedAt)
      throw new BadRequestException('Email already verified.');
    if (isBefore(record.expiresAt, new Date()))
      throw new BadRequestException('Verification code expired.');
    if (record.code !== code)
      throw new BadRequestException('Invalid verification code.');

    await this.prisma.emailVerification.update({
      where: { email },
      data: { verifiedAt: new Date() },
    });
  }

  /** Utility to check verified state (optional for AuthModule use) */
  async isEmailVerified(email: string): Promise<boolean> {
    const record = await this.prisma.emailVerification.findUnique({
      where: { email },
    });
    return !!record?.verifiedAt;
  }
}
