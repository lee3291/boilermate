/**
 * Roommate Review Service
 * API calls for roommate reviews
 */

import api from './api';
import type {
  GetReviewsRequest,
  GetReviewsResponse,
  AddReviewRequest,
  AddReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  DeleteReviewRequest,
  DeleteReviewResponse,
} from '@/types/roommate-review';

const BASE_URL = '/roommates/reviews';

/**
 * Get eligible roommate periods for review
 * GET /roommates/reviews/eligible?reviewerId=xxx&reviewedId=xxx
 */
export const getEligibleRoommatesForReview = async (params: {
  reviewerId: string;
  reviewedId: string;
}): Promise<{ eligibleRoommates: Array<{ id: string; startDate: Date; endDate: Date | null; isActive: boolean }> }> => {
  const response = await api.get(`${BASE_URL}/eligible`, { params });
  return response.data;
};

/**
 * Get all reviews for a user
 * GET /roommates/reviews?reviewedId=xxx&roommateId=xxx
 */
export const getReviews = async (
  params: GetReviewsRequest
): Promise<GetReviewsResponse> => {
  const response = await api.get(`${BASE_URL}`, { params });
  return response.data;
};

/**
 * Add a review
 * POST /roommates/reviews
 */
export const addReview = async (
  data: AddReviewRequest
): Promise<AddReviewResponse> => {
  const response = await api.post(`${BASE_URL}`, data);
  return response.data;
};

/**
 * Update a review
 * PUT /roommates/reviews/:reviewId
 */
export const updateReview = async (
  reviewId: string,
  data: UpdateReviewRequest
): Promise<UpdateReviewResponse> => {
  const response = await api.put(`${BASE_URL}/${reviewId}`, data);
  return response.data;
};

/**
 * Delete a review
 * DELETE /roommates/reviews/:reviewId?reviewerId=xxx
 */
export const deleteReview = async (
  reviewId: string,
  params: DeleteReviewRequest
): Promise<DeleteReviewResponse> => {
  const response = await api.delete(`${BASE_URL}/${reviewId}`, { params });
  return response.data;
};
