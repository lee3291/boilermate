import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { imageRequestDetails } from './interfaces/image.interface';

@Injectable()
export class UploadsService {
  private readonly s3Client = new S3Client({
    region: 'your-aws-region',
  });
  private readonly bucketName = 'your-s3-bucket-name';

  async generateUploadUrl(imageRequestDetails: imageRequestDetails) {
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
    return { preSignedUrl, key };
  }
}