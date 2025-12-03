/**
 * Recommendation Request DTOs
 * Used for controller -> service communication
 */

import { IsString, IsUUID } from 'class-validator';

/**
 * Get top recommendations for a user
 */
export class GetRecommendationsDto {
  @IsString()
  @IsUUID()
  userId: string;
}

/**
 * Accept a recommendation (send invitation)
 */
export class AcceptRecommendationDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  candidateId: string;
}

/**
 * Decline a recommendation
 */
export class DeclineRecommendationDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  candidateId: string;
}
