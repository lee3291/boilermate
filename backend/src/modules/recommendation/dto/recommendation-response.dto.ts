/**
 * Recommendation Response DTOs
 * Used for service -> controller -> client communication
 */

/**
 * User details in recommendation
 */
export class RecommendationUserDto {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;
  bio?: string;

  static fromUser(user: any): RecommendationUserDto {
    return {
      id: user.id,
      email: user.email,
      legalName: user.legalName,
      avatarURL: user.avatarURL,
      bio: user.bio,
    };
  }
}

/**
 * Single recommendation with score and reasons
 */
export class RecommendationDto {
  id: string;
  candidateId: string;
  score: number;
  reasons?: {
    topMatches?: string[];
    categories?: Record<string, boolean>;
  };
  createdAt: Date;
  candidate?: RecommendationUserDto;

  static fromRecommendation(rec: any): RecommendationDto {
    return {
      id: rec.id,
      candidateId: rec.candidateId,
      score: rec.score,
      reasons: rec.reasons || undefined,
      createdAt: rec.createdAt,
      candidate: rec.candidate ? RecommendationUserDto.fromUser(rec.candidate) : undefined,
    };
  }
}

/**
 * List of recommendations
 */
export class RecommendationsResponseDto {
  recommendations: RecommendationDto[];
  total: number;

  static fromRecommendations(recommendations: any[]): RecommendationsResponseDto {
    return {
      recommendations: recommendations.map(r => RecommendationDto.fromRecommendation(r)),
      total: recommendations.length,
    };
  }
}

/**
 * Accept recommendation response
 */
export class AcceptRecommendationResponseDto {
  success: boolean;
  message: string;
  chatId?: string;

  static fromAccept(success: boolean, chatId?: string): AcceptRecommendationResponseDto {
    return {
      success,
      message: success ? 'Invitation sent successfully' : 'Failed to send invitation',
      chatId,
    };
  }
}

/**
 * Decline recommendation response
 */
export class DeclineRecommendationResponseDto {
  success: boolean;
  message: string;

  static fromDecline(success: boolean): DeclineRecommendationResponseDto {
    return {
      success,
      message: success ? 'Recommendation declined' : 'Failed to decline recommendation',
    };
  }
}
