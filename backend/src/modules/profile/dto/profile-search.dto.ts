/**
 * Profile Search DTOs
 * For searching and filtering users
 */

import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

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
