/**
 * Profile DTOs
 */

import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

//* Get Profile Details DTO
export class GetProfileDetailsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  viewerId?: string;
}

//* Search Users Query DTO
export class SearchUsersDto {
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferenceIds?: string[];

  @IsOptional()
  @IsEnum(['equal', 'less_or_equal', 'greater_or_equal'])
  importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  importanceValue?: number;
}

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

