//TODO: may need an image object ??? although currently never need it

export interface GetPresignedUrlRequest {
  contentType: string; // e.g., 'image/jpeg', 'image/png'
  userId: string;
}

export interface GetPresignedUrlResponse {
  preSignedUrl: string; // one-time URL to upload the file directly to S3.
  key: string; // unique key (filename) for the object in the S3 bucket, send to backend after upload complete
}