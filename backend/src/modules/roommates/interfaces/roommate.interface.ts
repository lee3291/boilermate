/**
 * Roommate Service Interfaces
 * These interfaces define the contract between the controller and service layer
 * Service layer works with these interfaces, not DTOs
 */

/**
 * Basic user information for roommate relationships
 */
export interface RoommateUserDetails {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;
}

/**
 * Roommate request details
 */
export interface RoommateRequestDetails {
  id: string;
  requesterId: string;
  requestedId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  requester?: RoommateUserDetails;
  requested?: RoommateUserDetails;
}

/**
 * Roommate relationship details
 */
export interface RoommateDetails {
  id: string;
  user1Id: string;
  user2Id: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  user1?: RoommateUserDetails;
  user2?: RoommateUserDetails;
}

/**
 * Review details
 */
export interface RoommateReviewDetails {
  id: string;
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: RoommateUserDetails;
  reviewed?: RoommateUserDetails;
}

// ============= Service Method Interfaces =============

/**
 * Send a roommate request
 */
export interface SendRoommateRequestDetails {
  requesterId: string;
  requestedId: string;
  message?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SendRoommateRequestResults {
  request: RoommateRequestDetails;
}

/**
 * Get all requests (sent or received) for a user
 */
export interface GetRoommateRequestsDetails {
  userId: string;
  type?: 'sent' | 'received' | 'all'; // Filter by request type
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'; // Filter by status
}

export interface GetRoommateRequestsResults {
  requests: RoommateRequestDetails[];
}

/**
 * Accept a roommate request
 */
export interface AcceptRoommateRequestDetails {
  requestId: string;
  userId: string; // Must be the requested user
}

export interface AcceptRoommateRequestResults {
  request: RoommateRequestDetails;
  roommate: RoommateDetails;
}

/**
 * Reject a roommate request
 */
export interface RejectRoommateRequestDetails {
  requestId: string;
  userId: string; // Must be the requested user
}

export interface RejectRoommateRequestResults {
  request: RoommateRequestDetails;
}

/**
 * Withdraw a pending roommate request
 */
export interface WithdrawRoommateRequestDetails {
  requestId: string;
  userId: string; // Must be the requester
}

export interface WithdrawRoommateRequestResults {
  success: boolean;
}

/**
 * Get all roommates for a user
 */
export interface GetRoommatesDetails {
  userId: string;
  activeOnly?: boolean; // Only return active roommates
}

export interface GetRoommatesResults {
  roommates: RoommateDetails[];
}

/**
 * End a roommate relationship
 */
export interface EndRoommateRelationshipDetails {
  roommateId: string;
  userId: string; // Either user1 or user2
}

export interface EndRoommateRelationshipResults {
  roommate: RoommateDetails;
}

/**
 * Search for users (for sending requests)
 */
export interface SearchUsersDetails {
  userId: string; // Current user
  query?: string; // Search term (email, username)
  excludeRoommates?: boolean; // Exclude existing roommates
  excludePendingRequests?: boolean; // Exclude users with pending requests
}

export interface SearchUsersResults {
  users: RoommateUserDetails[];
}

// ============= Review Interfaces =============

/**
 * Get Reviews
 */
export interface GetReviewsDetails {
  reviewedId: string;
  roommateId?: string;
}

export interface GetReviewsResults {
  reviews: RoommateReviewDetails[];
}

/**
 * Add Review
 */
export interface AddReviewDetails {
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
}

export interface AddReviewResults {
  review: RoommateReviewDetails;
}

/**
 * Update Review
 */
export interface UpdateReviewDetails {
  reviewId: string;
  reviewerId: string;
  rating?: number;
  comment?: string;
}

export interface UpdateReviewResults {
  review: RoommateReviewDetails;
}

/**
 * Delete Review
 */
export interface DeleteReviewDetails {
  reviewId: string;
  reviewerId: string;
}

export interface DeleteReviewResults {
  success: boolean;
}
