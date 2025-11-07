/**
 * Search Response DTOs
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileSummaryDto } from './profile-summary.response.dto';

//* Search Users Response
@Exclude()
export class SearchUsersResponseDto {
  @Expose()
  @Type(() => ProfileSummaryDto)
  profiles: ProfileSummaryDto[];
  
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  static fromProfiles(profiles: any[], total: number, page: number, limit: number): SearchUsersResponseDto {
    const dto = new SearchUsersResponseDto();
    dto.profiles = profiles;
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}
