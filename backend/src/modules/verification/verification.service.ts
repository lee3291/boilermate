import { PrismaService } from '@core/database/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from '../uploads/uploads.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import type { VerificationStatus } from '@prisma/client';

@Injectable()
export class VerificationService {
  async removeVerificationImage(requestId: string, adminId: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new NotFoundException('Verification request not found.');
    if (!request.idImageURL || !request.idImageKey) return request;
    // Delete from S3
    await this.uploadsService.deleteFile(request.idImageKey);
    // Set idImageURL and idImageKey to null
    const updated = await this.prisma.verificationRequest.update({
      where: { id: requestId },
      data: { idImageURL: '', idImageKey: '' },
    });
    return updated;
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
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
        userId: userId,
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

    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_REGION');

    // Construct the full URL from the key
    const idImageURL = `https://${bucket}.s3.${region}.amazonaws.com/${idImageKey}`;

    const newRequest = await this.prisma.verificationRequest.create({
      data: {
        user: {
          connect: { id: userId },
        },
        idImageURL,
        idImageKey, // Storing the key is useful for deletion later
        status: 'PENDING',
      },
    });

    return newRequest;
  }

  async getVerificationRequests(status?: VerificationStatus) {
    return this.prisma.verificationRequest.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            legalName: true,
            profileInfo: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async updateVerificationStatus(
    requestId: string,
    adminId: string,
    dto: { status: VerificationStatus; reason?: string },
  ) {
    const { status, reason } = dto;

    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found.');
    }

    // Use a transaction to ensure data consistency
    return this.prisma.$transaction(async (tx) => {
      // Update the verification request
      const updatedRequest = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status,
          reason,
          reviewedBy: { connect: { id: adminId } },
        },
        // Include the user details in the response to ensure the frontend
        // has the necessary data to re-render the row without crashing.
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profileInfo: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // If approved, update the user's verification status
      if (status === 'APPROVED') {
        await tx.user.update({
          where: { id: request.userId },
          data: { isVerified: true },
        });
      } else if (status === 'DECLINED') {
        // If a request is declined, we can also set isVerified to false,
        // in case a previously approved user is re-evaluated.
        await tx.user.update({
          where: { id: request.userId },
          data: { isVerified: false },
        });
      }

      return updatedRequest;
    });
  }
}
