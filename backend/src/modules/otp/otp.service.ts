import { Injectable, NotFoundException} from '@nestjs/common';
import nodemailer from 'nodemailer';
import {OTPRecord} from './interfaces/otp.interface';
import {User} from './interfaces/otp.interface';
import { PrismaClient} from '@prisma/client';
@Injectable()
export class OTPService {
    //Store OPT for each user
    private prisma = new PrismaClient();
    private otpStore: Record<string, OTPRecord> = {};

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(email: string): Promise<void> {
        const otp = this.generateOTP();

        // OTP valid for 5mins
        this.otpStore[email] = { otp, expires: Date.now() + 300 * 1000 };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"BoilerMate" <no-reply@boilermate.com>',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
        });
    }
    verifyOTP(email: string, otp: string): boolean {
        const record = this.otpStore[email];
        if (!record) {
            return false;
        }
        if (record.expires < Date.now()) {
            return false;
        }
        if (record.otp !== otp) {
            return false;
        }
        return true;
    }

    /**
     * Get user by email
     */
    async findUser(email: string): Promise<Partial<User>> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Update password
     */
    async updatePassword(email: string, newPassword:string): Promise<Partial<User>> {
        await this.findUser(email); // ensure it exists
        return this.prisma.user.update({
            where: { email },
            data: {passwordHash: newPassword},
        });
    }
}
