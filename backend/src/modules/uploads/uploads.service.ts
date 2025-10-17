import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { imageRequestDetails, imageRequestResult } from './interfaces/image.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  // use constructor to help setup the s3 variables
  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing AWS configuration');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async generateUploadUrl(imageRequestDetails: imageRequestDetails): Promise<imageRequestResult> {
    // Determine the file extension from the content type
    const { contentType, userId } = imageRequestDetails;
    const extension = contentType.split('/')[1] || 'jpg';
    
    // Generate a unique, random key
    const key = `uploads/${userId}/${uuidv4()}.${extension}`;

    // Create the command for the pre-signed URL
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate the pre-signed URL, valid for 5 minutes
    const preSignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    // Return both the URL for uploading and the key for saving later
    return { 
      preSignedUrl,
      key 
    };
  }
}