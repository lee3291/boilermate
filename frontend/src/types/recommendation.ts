/**
 * Recommendation Types
 * Type definitions for the recommendation system
 */

export interface RecommendationUser {
  id: string;
  email: string;
  legalName: string | null;
  avatarURL: string | null;
  bio: string | null;
}

export interface RecommendationReasons {
  topMatches: string[];
  categories: Record<string, boolean>;
}

export interface Recommendation {
  id: string;
  candidateId: string;
  score: number;
  reasons?: RecommendationReasons;
  createdAt: string;
  candidate?: RecommendationUser;
}

export interface GetRecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
}

export interface AcceptRecommendationRequest {
  userId: string;
  candidateId: string;
}

export interface AcceptRecommendationResponse {
  success: boolean;
  message: string;
  chatId?: string;
}

export interface DeclineRecommendationRequest {
  userId: string;
  candidateId: string;
}

export interface DeclineRecommendationResponse {
  success: boolean;
  message: string;
}
