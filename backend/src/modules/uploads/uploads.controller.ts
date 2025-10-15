import { Controller, Post, Body, Req, Logger, InternalServerErrorException } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { imageRequestDto, requestUrlResponseDto } from './dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('request-url')
  async getUploadUrl(@Body() dto: imageRequestDto): Promise<requestUrlResponseDto> {
    const result = await this.uploadsService.generateUploadUrl(dto);
    return requestUrlResponseDto.fromInterface(result);
  }
}