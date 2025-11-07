import { Module } from '@nestjs/common';
import { ReCaptchaController } from './reCaptcha.controller';
import { ReCaptchaService } from './reCaptcha.service';

@Module({
    controllers: [ReCaptchaController ],
    providers: [ ReCaptchaService],
})
export class ReCaptchaModule {}