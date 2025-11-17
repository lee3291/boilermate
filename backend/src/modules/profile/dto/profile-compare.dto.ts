/**
 * Profile Compare DTOs
 * For comparing multiple user profiles side-by-side
 */

import { IsString, IsOptional } from 'class-validator';

//* Get Compare Profiles DTO
export class GetCompareProfilesDto {
  // Comma-separated list of user IDs to compare
  @IsString()
  userIds: string;

  // The ID of the user viewing these profiles (to check favorite status)
  @IsOptional()
  @IsString()
  viewerId?: string;
}
