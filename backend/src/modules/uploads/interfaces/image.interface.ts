export interface imageRequestDetails {
  contentType: string;
  userId: string;
}

export interface imageRequestResult {
  preSignedUrl: string,
  key: string,
}