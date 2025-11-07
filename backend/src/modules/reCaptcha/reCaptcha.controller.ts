import { Body, Controller, Post } from '@nestjs/common';
import { ReCaptchaService } from './reCaptcha.service';

@Controller()
export class ReCaptchaController {
    constructor(private readonly reCaptchaService: ReCaptchaService) {}

    @Post('verify-captcha')
    async verify(@Body('token') token: string) {
        const result = await this.reCaptchaService.verifyToken(token);
        return result;
    }
}
