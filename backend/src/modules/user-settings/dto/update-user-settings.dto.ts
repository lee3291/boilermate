
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  email_on_follow_profile_update?: boolean;

  @IsBoolean()
  @IsOptional()
  email_on_follow_new_listing?: boolean;

  @IsBoolean()
  @IsOptional()
  email_on_listing_outdated?: boolean;

  @IsBoolean()
  @IsOptional()
  email_on_listing_27days_old?: boolean;
}
