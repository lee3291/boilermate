import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('verification')
@UseGuards(AuthGuard('jwt'))
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('status')
  getStatus(@GetUser('userId') userId: string) {
    return this.verificationService.getVerificationStatus(userId);
  }

  @Post('upload-url')
  generateUploadUrl(
    @GetUser('userId') userId: string,
    @Body() dto: GenerateUploadUrlDto,
  ) {
    return this.verificationService.generateVerificationUploadUrl(
      userId,
      dto.contentType,
    );
  }

  @Post()
  createRequest(
    @GetUser('userId') userId: string,
    @Body() dto: CreateVerificationRequestDto,
  ) {
    return this.verificationService.createVerificationRequest(userId, dto);
  }
}
