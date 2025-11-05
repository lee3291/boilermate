import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('verification')
@UseGuards(AuthGuard('jwt'))
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('status')
  getStatus(@GetUser() user: User) {
    return this.verificationService.getVerificationStatus(user.id);
  }

  @Post('upload-url')
  generateUploadUrl(@GetUser() user: User, @Body() dto: GenerateUploadUrlDto) {
    return this.verificationService.generateVerificationUploadUrl(
      user.id,
      dto.contentType,
    );
  }

  @Post()
  createRequest(
    @GetUser() user: User,
    @Body() dto: CreateVerificationRequestDto,
  ) {
    return this.verificationService.createVerificationRequest(user.id, dto);
  }
}
