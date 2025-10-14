import { Controller, Post, Body, Req } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { imageRequestDto } from './dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  async getUploadUrl(@Body() dto: imageRequestDto) {
    // Assuming you have the userId from an authenticated request
    return this.uploadsService.generateUploadUrl(dto as any);
  }
}