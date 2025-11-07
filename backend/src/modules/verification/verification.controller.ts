import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role, VerificationStatus } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';

@Controller('verification')
@UseGuards(AuthGuard('jwt'))
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('status')
  getStatus(@GetUser('userId') userId: string) {
    return this.verificationService.getVerificationStatus(userId);
  }

  @Get('admin/requests')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getVerificationRequests(@Query('status') status?: VerificationStatus) {
    return this.verificationService.getVerificationRequests(status);
  }

  @Patch('admin/requests/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateVerificationStatus(
    @Param('id') requestId: string,
    @GetUser('userId') adminId: string,
    @Body() dto: UpdateVerificationStatusDto,
  ) {
    return this.verificationService.updateVerificationStatus(
      requestId,
      adminId,
      dto,
    );
  }

  @Post('admin/requests/:id/remove-image')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async removeVerificationImage(
    @Param('id') requestId: string,
    @GetUser('userId') adminId: string,
  ) {
    return this.verificationService.removeVerificationImage(requestId, adminId);
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
