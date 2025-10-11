import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import {OTPRecord} from './interfaces/otp.interface';
@Injectable()
export class OTPService {
    //Store OPT for each user
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
}
