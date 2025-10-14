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

/**
 * Requests a secure, pre-signed URL from the backend to upload a file.
 * @param request - The request payload, containing the file's content type.
 * @returns An object with the preSignedUrl, key, and final URL.
 */
export async function getPresignedUrl(request: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
  try {
    const res = await api.post('/uploads/request-url', request);
    return res.data;
  } catch (error: any) {
    console.error('Failed to get pre-signed URL:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Uploads a file directly to S3 using the provided pre-signed URL.
 * This function bypasses our backend server.
 * @param preSignedUrl - The secure URL received from the backend.
 * @param file - The file to upload (e.g., the compressed image).
 */
export async function uploadFileToS3(preSignedUrl: string, file: File): Promise<void> {
  try {
    await axios.put(preSignedUrl, file, {
      headers: {
        'Content-Type': file.type, // S3 requires the content type header for uploads
      },
    });

    // construct the final
    /**
     * key takeaway is that you don't get the final image URL back from this request. 
     * You must construct the final URL yourself on the frontend using the bucket's base URL 
     * and the key you used to generate the pre-signed URL in the first place.
     */
  } catch (error: any) {
    console.error('Failed to upload file to S3:', error);
    throw error.response?.data ?? error;
  }
}