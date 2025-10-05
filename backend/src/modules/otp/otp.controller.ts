import { Controller, Post, Body } from '@nestjs/common';
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
}
