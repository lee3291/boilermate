/**
 * Compare Profiles Response DTO
 * Used when comparing multiple user profiles
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileDetailsDto } from './profile-details.response.dto';

//* Compare Profiles Response
@Exclude()
export class CompareProfilesResponseDto {
  @Expose()
  @Type(() => ProfileDetailsDto)
  profiles: ProfileDetailsDto[];

  @Expose()
  count: number;

  static fromProfiles(profiles: ProfileDetailsDto[]): CompareProfilesResponseDto {
    const dto = new CompareProfilesResponseDto();
    dto.profiles = profiles;
    dto.count = profiles.length;
    return dto;
  }
}
