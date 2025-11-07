import { PrismaService } from '@core/database/prisma.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { EmailVerificationService } from '@modules/email-verification/email-verification.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'INACTIVE') {
      // User is deactivated. Issue a short-lived token for the reactivation process.
      const reactivationPayload = {
        sub: user.id,
        email: user.email,
        purpose: 'reactivation',
      };
      const reactivationToken = await this.jwtService.signAsync(
        reactivationPayload,
        {
          expiresIn: '10m', // This token is valid for 10 minutes
        },
      );
      return { status: 'deactivated', reactivationToken };
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact customer support.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      avatarURL: user.avatarURL,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async requestCode(dto: RequestCodeDto) {
    const { email } = dto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }
    return this.emailVerificationService.createVerification(email);
  }

  async verifyCode(dto: VerifyCodeDto) {
    return this.emailVerificationService.verifyCode(dto.email, dto.code);
  }

  async register(dto: RegisterDto) {
    const isVerified = await this.emailVerificationService.isEmailVerified(
      dto.email,
    );
    if (!isVerified) {
      throw new UnauthorizedException(
        'Email has not been verified. Please verify your email before registering.',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
      },
    });

    return { id: user.id, email: user.email };
  }

  async requestReactivationCode(email: string) {
    // This method assumes the user's identity has been verified by the ReactivationGuard.
    // It simply sends a new verification code to the user's email.
    return this.emailVerificationService.createVerification(email);
  }

  async reactivateAccount(userId: string, email: string, code: string) {
    // 1. Verify the OTP code
    await this.emailVerificationService.verifyCode(email, code);

    // 2. Reactivate the account
    await this.prisma.user.update({
      where: { id: userId, status: 'INACTIVE' },
      data: { status: 'ACTIVE' },
    });

    // 3. Return a new session token
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      // This should theoretically never happen if the reactivation token was valid
      throw new UnauthorizedException('User not found after reactivation.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      avatarURL: user.avatarURL,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
