/**
 * Roommate Types
 * Type definitions for roommate requests and relationships
 */

/**
 * User details in roommate context
 */
export interface RoommateUser {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;
}

/**
 * Roommate request status
 */
export type RoommateRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/**
 * Roommate request
 */
export interface RoommateRequest {
  id: string;
  requesterId: string;
  requestedId: string;
  status: RoommateRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  requester: RoommateUser;
  requested: RoommateUser;
}

/**
 * Roommate relationship
 */
export interface Roommate {
  id: string;
  user1Id: string;
  user2Id: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  user1: RoommateUser;
  user2: RoommateUser;
}

// ============= API Request/Response Types =============

/**
 * Send roommate request
 */
export interface SendRoommateRequestRequest {
  requesterId: string;
  requestedId: string;
  message?: string;
}

export interface SendRoommateRequestResponse extends RoommateRequest {}

/**
 * Get roommate requests
 */
export interface GetRoommateRequestsRequest {
  userId: string;
  type?: 'sent' | 'received' | 'all';
  status?: RoommateRequestStatus;
}

export interface GetRoommateRequestsResponse {
  requests: RoommateRequest[];
}

/**
 * Accept roommate request
 */
export interface AcceptRoommateRequestRequest {
  requestId: string;
  userId: string;
}

export interface AcceptRoommateRequestResponse {
  request: RoommateRequest;
  roommate: Roommate;
}

/**
 * Reject roommate request
 */
export interface RejectRoommateRequestRequest {
  requestId: string;
  userId: string;
}

export interface RejectRoommateRequestResponse extends RoommateRequest {}

/**
 * Withdraw roommate request
 */
export interface WithdrawRoommateRequestRequest {
  requestId: string;
  userId: string;
}

/**
 * Get roommates
 */
export interface GetRoommatesRequest {
  userId: string;
  activeOnly?: boolean;
}

export interface GetRoommatesResponse {
  roommates: Roommate[];
}

/**
 * End roommate relationship
 */
export interface EndRoommateRelationshipRequest {
  roommateId: string;
  userId: string;
}

export interface EndRoommateRelationshipResponse extends Roommate {}

/**
 * Search users for roommate
 */
export interface SearchUsersForRoommateRequest {
  userId: string;
  query: string;
}

export interface SearchUsersForRoommateResponse {
  users: RoommateUser[];
}
