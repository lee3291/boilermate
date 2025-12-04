import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('logs')
  getLogs() {
    return this.emailService.getLogs();
  }



  @Post('send')
    async sendEmail(@Body() dto: SendEmailDto) {
  return this.emailService.sendEmail(dto);
}
}
