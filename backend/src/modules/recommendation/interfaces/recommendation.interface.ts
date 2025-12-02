/**
 * Recommendation Service Interfaces
 * These interfaces define the contract between the controller and service layer
 * Service layer works with these interfaces, not DTOs
 */

/**
 * User information for recommendations
 */
export interface RecommendationUserDetails {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;
  bio?: string;
  lifestylePreferencesCount?: number;
  roommatePreferencesCount?: number;
  likesReceived?: number;
  dislikesReceived?: number;
}

/**
 * Recommendation details
 */
export interface RecommendationDetails {
  id: string;
  userId: string;
  candidateId: string;
  score: number;
  reasons?: {
    topMatches?: string[];
    categories?: Record<string, boolean>;
  };
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidate?: RecommendationUserDetails;
}

/**
 * Recommendation interaction details
 */
export interface RecommendationInteractionDetails {
  id: string;
  userId: string;
  candidateId: string;
  action: 'ACCEPT' | 'DECLINE';
  createdAt: Date;
}

// ============= Service Method Interfaces =============

/**
 * Get recommendations for a user
 */
export interface GetRecommendationsDetails {
  userId: string;
}

export interface GetRecommendationsResults {
  recommendations: RecommendationDetails[];
}

/**
 * Accept a recommendation
 */
export interface AcceptRecommendationDetails {
  userId: string;
  candidateId: string;
}

export interface AcceptRecommendationResults {
  success: boolean;
  chatId?: string;
}

/**
 * Decline a recommendation
 */
export interface DeclineRecommendationDetails {
  userId: string;
  candidateId: string;
}

export interface DeclineRecommendationResults {
  success: boolean;
}

/**
 * User preference data for matching algorithm
 */
export interface UserPreferenceData {
  id: string;
  email: string;
  status: string;
  profilePreferences: Array<{
    preference: {
      id: string;
      label: string;
      value: string;
      category: string;
    };
  }>;
  roommatePreferences: Array<{
    preference: {
      id: string;
      label: string;
      value: string;
      category: string;
    };
    importance: number;
  }>;
}

/**
 * Match calculation result
 */
export interface MatchResult {
  candidateId: string;
  score: number;
  reasons: {
    topMatches: string[];
    categories: Record<string, boolean>;
  };
}
