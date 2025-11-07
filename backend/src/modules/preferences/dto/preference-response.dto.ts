/**
 * Response DTOs for Preferences
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { PreferenceDetails, UserProfilePreferenceDetails, RoommatePreferenceDetails } from '../interfaces/preference.interface';

//* Preference Response DTO (Master list)
@Exclude()
export class PreferenceDto {
  @Expose() id: string;
  @Expose() category: string;
  @Expose() label: string;
  @Expose() value: string;
  @Expose() mustHave: boolean;

  static fromPreference(preference: any): PreferenceDto {
    const dto = new PreferenceDto();
    dto.id = preference.id;
    dto.category = preference.category;
    dto.label = preference.label;
    dto.value = preference.value;
    dto.mustHave = preference.mustHave;
    return dto;
  }
}

@Exclude()
export class GetPreferencesResponseDto {
  @Expose()
  @Type(() => PreferenceDto)
  preferences: PreferenceDto[];

  static fromPreferences(preferences: any[]): GetPreferencesResponseDto {
    const dto = new GetPreferencesResponseDto();
    dto.preferences = preferences.map(p => PreferenceDto.fromPreference(p));
    return dto;
  }
}

//* User Profile Preference Response DTO
@Exclude()
export class UserProfilePreferenceDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() preferenceId: string;
  @Expose() importance: number;
  @Expose() visibility: string;
  
  @Expose()
  @Type(() => PreferenceDto)
  preference?: PreferenceDto;

  static fromUserProfilePreference(upp: any): UserProfilePreferenceDto {
    const dto = new UserProfilePreferenceDto();
    dto.id = upp.id;
    dto.userId = upp.userId;
    dto.preferenceId = upp.preferenceId;
    dto.importance = upp.importance;
    dto.visibility = upp.visibility;
    if (upp.preference) {
      dto.preference = PreferenceDto.fromPreference(upp.preference);
    }
    return dto;
  }
}

@Exclude()
export class GetUserProfilePreferencesResponseDto {
  @Expose()
  @Type(() => UserProfilePreferenceDto)
  preferences: UserProfilePreferenceDto[];

  static fromUserProfilePreferences(preferences: any[]): GetUserProfilePreferencesResponseDto {
    const dto = new GetUserProfilePreferencesResponseDto();
    dto.preferences = preferences.map(p => UserProfilePreferenceDto.fromUserProfilePreference(p));
    return dto;
  }
}

//* Roommate Preference Response DTO
@Exclude()
export class RoommatePreferenceDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() preferenceId: string;
  @Expose() importance: number;
  @Expose() visibility: string;
  
  @Expose()
  @Type(() => PreferenceDto)
  preference?: PreferenceDto;

  static fromRoommatePreference(rp: any): RoommatePreferenceDto {
    const dto = new RoommatePreferenceDto();
    dto.id = rp.id;
    dto.userId = rp.userId;
    dto.preferenceId = rp.preferenceId;
    dto.importance = rp.importance;
    dto.visibility = rp.visibility;
    if (rp.preference) {
      dto.preference = PreferenceDto.fromPreference(rp.preference);
    }
    return dto;
  }
}

@Exclude()
export class GetRoommatePreferencesResponseDto {
  @Expose()
  @Type(() => RoommatePreferenceDto)
  preferences: RoommatePreferenceDto[];

  static fromRoommatePreferences(preferences: any[]): GetRoommatePreferencesResponseDto {
    const dto = new GetRoommatePreferencesResponseDto();
    dto.preferences = preferences.map(p => RoommatePreferenceDto.fromRoommatePreference(p));
    return dto;
  }
}
