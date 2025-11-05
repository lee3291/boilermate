import api from './api';
import axios from 'axios';

export interface VerificationStatus {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'DECLINED';
  reason?: string;
  submittedAt?: string;
}

/**
 * Fetches the current user's verification status.
 */
export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  const response = await api.get<VerificationStatus>('/verification/status');
  return response.data;
};

/**
 * Requests a pre-signed URL for uploading an ID image.
 * @param contentType The MIME type of the file to be uploaded.
 */
export const getUploadUrl = async (contentType: string) => {
  const response = await api.post<{ preSignedUrl: string; key: string }>(
    '/verification/upload-url',
    { contentType },
  );
  return response.data;
};

/**
 * Uploads the file directly to the provided S3 pre-signed URL.
 * @param url The pre-signed URL from S3.
 * @param file The file to upload.
 */
export const uploadIdImage = async (url: string, file: File) => {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};

/**
 * Notifies the backend that the upload is complete and creates the verification request.
 * @param idImageKey The key of the uploaded object in S3.
 */
export const createVerificationRequest = async (idImageKey: string) => {
  const response = await api.post('/verification', { idImageKey });
  return response.data;
};

/**
 * Fetches all verification requests for the admin dashboard.
 * @param status An optional status to filter the requests by.
 */
export const getVerificationRequests = async (status?: string) => {
  const response = await api.get('/verification/admin/requests', {
    params: { status },
  });
  return response.data;
};

/**
 * Updates the status of a verification request.
 * @param requestId The ID of the request to update.
 * @param status The new status ('APPROVED' or 'DECLINED').
 * @param reason An optional reason for declining.
 */
export const updateVerificationStatus = async (
  requestId: string,
  status: 'APPROVED' | 'DECLINED',
  reason?: string,
) => {
  const response = await api.patch(
    `/verification/admin/requests/${requestId}`,
    { status, reason },
  );
  return response.data;
};
