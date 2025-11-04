/**
 * Profile View DTOs
 * For viewing own profile and other users' profiles
 */

import { IsString, IsOptional } from 'class-validator';

//* Get Profile Details DTO
export class GetProfileDetailsDto {
  @IsString()
  userId: string;

  // The ID of the user viewing this profile (to check favorite status)
  @IsOptional()
  @IsString()
  viewerId?: string;
}
