/**
 * Roommate Review DTOs
 * Used for API request/response validation
 */

import { IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for getting reviews
 */
export class GetReviewsDto {
  @IsString()
  reviewedId: string;

  @IsOptional()
  @IsString()
  roommateId?: string;
}

/**
 * DTO for adding a review
 */
export class AddReviewDto {
  @IsString()
  reviewerId: string;

  @IsString()
  reviewedId: string;

  @IsString()
  roommateId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

/**
 * DTO for updating a review
 */
export class UpdateReviewDto {
  @IsString()
  reviewerId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

/**
 * DTO for deleting a review
 */
export class DeleteReviewDto {
  @IsString()
  reviewerId: string;
}
