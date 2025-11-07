/**
 * Favorite Response DTOs
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileSummaryDto } from './profile-summary.response.dto';

//* Get Favorites Response DTO
@Exclude()
export class GetFavoritesResponseDto {
  @Expose()
  @Type(() => ProfileSummaryDto)
  favorites: ProfileSummaryDto[];
  
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  static fromFavorites(favorites: any[], total: number, page: number, limit: number): GetFavoritesResponseDto {
    const dto = new GetFavoritesResponseDto();
    dto.favorites = favorites;
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}
