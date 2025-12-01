/**
 * Recommendation Service
 * API calls for roommate recommendation system
 */

import api from './api';
import type {
  GetRecommendationsResponse,
  AcceptRecommendationRequest,
  AcceptRecommendationResponse,
  DeclineRecommendationRequest,
  DeclineRecommendationResponse,
} from '@/types/recommendation';

/**
 * Get personalized recommendations for a user
 */
export async function getRecommendations(userId: string): Promise<GetRecommendationsResponse> {
  const response = await api.get(`/recommendations/${userId}`);
  return response.data;
}

/**
 * Accept a recommendation (send chat invitation)
 */
export async function acceptRecommendation(
  request: AcceptRecommendationRequest
): Promise<AcceptRecommendationResponse> {
  const response = await api.post('/recommendations/accept', request);
  return response.data;
}

/**
 * Decline a recommendation (hide for 30 days)
 */
export async function declineRecommendation(
  request: DeclineRecommendationRequest
): Promise<DeclineRecommendationResponse> {
  const response = await api.post('/recommendations/decline', request);
  return response.data;
}
