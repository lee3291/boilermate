/**
 * Roommates Service
 * Handles API calls for roommate requests and relationships
 */

import api from './api';
import type {
  SendRoommateRequestRequest,
  SendRoommateRequestResponse,
  GetRoommateRequestsRequest,
  GetRoommateRequestsResponse,
  AcceptRoommateRequestRequest,
  AcceptRoommateRequestResponse,
  RejectRoommateRequestRequest,
  RejectRoommateRequestResponse,
  WithdrawRoommateRequestRequest,
  GetRoommatesRequest,
  GetRoommatesResponse,
  EndRoommateRelationshipRequest,
  EndRoommateRelationshipResponse,
  SearchUsersForRoommateRequest,
  SearchUsersForRoommateResponse,
} from '@/types/roommates';

const BASE_URL = '/roommates';

/**
 * Send a roommate request to another user
 * POST /roommates/requests
 */
export const sendRoommateRequest = async (
  data: SendRoommateRequestRequest
): Promise<SendRoommateRequestResponse> => {
  const response = await api.post(`${BASE_URL}/requests`, data);
  return response.data;
};

/**
 * Get roommate requests for current user
 * GET /roommates/requests?userId=xxx&type=sent|received|all&status=PENDING|ACCEPTED|REJECTED
 */
export const getRoommateRequests = async (
  params: GetRoommateRequestsRequest
): Promise<GetRoommateRequestsResponse> => {
  const response = await api.get(`${BASE_URL}/requests`, { params });
  return response.data;
};

/**
 * Accept a roommate request
 * POST /roommates/requests/:requestId/accept
 */
export const acceptRoommateRequest = async (
  requestId: string,
  data: AcceptRoommateRequestRequest
): Promise<AcceptRoommateRequestResponse> => {
  const response = await api.post(`${BASE_URL}/requests/${requestId}/accept`, data);
  return response.data;
};

/**
 * Reject a roommate request
 * POST /roommates/requests/:requestId/reject
 */
export const rejectRoommateRequest = async (
  requestId: string,
  data: RejectRoommateRequestRequest
): Promise<RejectRoommateRequestResponse> => {
  const response = await api.post(`${BASE_URL}/requests/${requestId}/reject`, data);
  return response.data;
};

/**
 * Withdraw a pending roommate request
 * DELETE /roommates/requests/:requestId?userId=xxx
 */
export const withdrawRoommateRequest = async (
  requestId: string,
  data: WithdrawRoommateRequestRequest
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`${BASE_URL}/requests/${requestId}`, {
    params: data,
  });
  return response.data;
};

/**
 * Get all roommates for a user
 * GET /roommates?userId=xxx&activeOnly=true
 */
export const getRoommates = async (
  params: GetRoommatesRequest
): Promise<GetRoommatesResponse> => {
  const response = await api.get(`${BASE_URL}`, { params });
  return response.data;
};

/**
 * End a roommate relationship
 * DELETE /roommates/:roommateId?userId=xxx
 */
export const endRoommateRelationship = async (
  roommateId: string,
  data: EndRoommateRelationshipRequest
): Promise<EndRoommateRelationshipResponse> => {
  const response = await api.delete(`${BASE_URL}/${roommateId}`, {
    params: data,
  });
  return response.data;
};

/**
 * Search for users to send roommate requests
 * GET /roommates/users/search?userId=xxx&query=john&excludeRoommates=true
 */
export const searchUsersForRoommate = async (
  params: SearchUsersForRoommateRequest
): Promise<SearchUsersForRoommateResponse> => {
  const response = await api.get(`${BASE_URL}/users/search`, { params });
  return response.data;
};
