import { Controller, Post, Body, Patch, NotFoundException } from '@nestjs/common';
import { OTPService } from './otp.service';

@Controller('otp') // This is the route prefix
export class OTPController {
    constructor(private readonly otpService: OTPService) {
    }

    @Post('send')
    sendOTP(@Body() body: { email: string }) {
        return this.otpService.sendOTP(body.email);
    }

    @Post('verify')
    verifyOTP(@Body() body: { email: string; otp: string }) {
        const valid = this.otpService.verifyOTP(body.email, body.otp);
        return { valid }; // true or false
    }


    @Patch('update-password')
    async updatePassword(
        @Body('email') email: string,
        @Body('newPassword') newPassword: string,
    ) {
        if (!email || !newPassword) {
            throw new NotFoundException('Email and new password are required');
        }

        const user = await this.otpService.updatePassword(email, newPassword);
        return {
            message: 'Password updated successfully',
            email: user.email,
        };
    }
}
