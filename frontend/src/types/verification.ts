/**
 * This file contains the type definitions for the user verification feature.
 * These types are used to ensure type safety and provide clear data contracts
 * between the frontend components and the backend API.
 */

// Represents the possible statuses of a verification request.
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

// Represents the user's profile information, which is a flexible JSON object.
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  // Add other profile fields as needed
  [key: string]: any;
}

// Represents the user associated with a verification request.
export interface VerificationUser {
  id: string;
  email: string;
  profileInfo: UserProfile | null;
}

// Represents a single verification request as returned by the admin endpoint.
export interface VerificationRequest {
  id: string;
  userId: string;
  idImageURL: string;
  status: VerificationStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  user: VerificationUser;
  reviewedBy?: {
    id: string;
    email: string;
  } | null;
}
