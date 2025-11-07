/**
 * Favorite DTOs
 * For managing user favorites
 */

import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

//* Add Favorite DTO
export class AddFavoriteDto {
  @IsString()
  userId: string;

  @IsString()
  favoritedUserId: string;
}

//* Remove Favorite DTO
export class RemoveFavoriteDto {
  @IsString()
  userId: string;

  @IsString()
  favoritedUserId: string;
}

//* Get Favorites Query DTO
export class GetFavoritesDto {
  @IsString()
  userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
