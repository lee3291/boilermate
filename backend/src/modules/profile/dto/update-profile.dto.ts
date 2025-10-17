import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  Matches,
} from 'class-validator';
import { SearchStatus } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be a 10-digit string of numbers.',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(SearchStatus)
  @IsOptional()
  searchStatus?: SearchStatus;

  @IsString()
  @IsOptional()
  lifestyleHashtags?: string;

  @IsBoolean()
  @IsOptional()
  isSmoker?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPets?: boolean;
}
