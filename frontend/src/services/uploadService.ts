import axios from 'axios';
import type { GetPresignedUrlRequest, GetPresignedUrlResponse } from '@/types/uploads';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * *NOTE:
 * User selects a file
 * You call this new compressImage utility.
 * You use the compressed file to get a pre-signed URL and then upload it.
 */

// Requests a secure, pre-signed URL from the backend to upload a file.
export async function getPresignedUrl(request: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
  try {
    const res = await api.post('/uploads/request-url', request);
    return res.data;
  } catch (error: any) {
    console.error('Failed to get pre-signed URL:', error);
    throw error.response?.data ?? error;
  }
}

// Uploads a file directly to S3 using the provided pre-signed URL
export async function uploadFileToS3(preSignedUrl: string, file: File): Promise<void> {
  try {
    await axios.put(preSignedUrl, file, {
      headers: {
        'Content-Type': file.type, // S3 requires the content type header for uploads
      },
    });
  } catch (error: any) {
    console.error('Failed to upload file to S3:', error);
    throw error.response?.data ?? error;
  }
}