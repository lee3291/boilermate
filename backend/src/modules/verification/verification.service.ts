import { PrismaService } from '@core/database/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadsService } from '../uploads/uploads.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getVerificationStatus(userId: string) {
    const request = await this.prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      return { status: 'NOT_SUBMITTED' };
    }

    return {
      status: request.status,
      reason: request.reason,
      submittedAt: request.createdAt,
    };
  }

  async generateVerificationUploadUrl(userId: string, contentType: string) {
    const existingRequest = await this.prisma.verificationRequest.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'You already have a pending or approved verification request.',
      );
    }

    return this.uploadsService.generateUploadUrl({
      userId,
      contentType,
      // We can add a sub-folder for verification documents if needed
    });
  }

  async createVerificationRequest(
    userId: string,
    dto: CreateVerificationRequestDto,
  ) {
    const { idImageKey } = dto;

    // Construct the full URL from the key
    const idImageURL = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${idImageKey}`;

    const newRequest = await this.prisma.verificationRequest.create({
      data: {
        userId,
        idImageURL,
        idImageKey, // Storing the key is useful for deletion later
        status: 'PENDING',
      },
    });

    return newRequest;
  }
}
