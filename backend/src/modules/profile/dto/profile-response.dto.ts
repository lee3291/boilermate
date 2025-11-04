/**
 * Profile Response DTOs
 */

import { Exclude, Expose, Type } from 'class-transformer';

//* Profile Summary Response (for listing/searching)
@Exclude()
export class ProfileSummaryDto {
  @Expose() id: string;
  @Expose() email: string;
  
  @Expose() age?: number;
  @Expose() major?: string;
  @Expose() year?: string;
  @Expose() bio?: string;
  
  @Expose() lifestylePreferencesCount: number;
  @Expose() roommatePreferencesCount: number;
  
  // Favorite status - whether current user has favorited this profile
  @Expose() isFavoritedByMe?: boolean;

  static fromProfile(profile: any, isFavoritedByMe?: boolean): ProfileSummaryDto {
    const dto = new ProfileSummaryDto();
    dto.id = profile.id;
    dto.email = profile.email;
    // TODO: Map username, firstName, lastName, profileImage when available
    dto.age = profile.age;
    dto.major = profile.major;
    dto.year = profile.year;
    dto.bio = profile.bio;
    dto.lifestylePreferencesCount = profile._count?.profilePreferences || 0;
    dto.roommatePreferencesCount = profile._count?.roommatePreferences || 0;
    dto.isFavoritedByMe = isFavoritedByMe || false;
    return dto;
  }
}

//* Preference Detail for Full Profile
@Exclude()
export class PreferenceDetailDto {
  @Expose() id: string;
  @Expose() category: string;
  @Expose() label: string;
  @Expose() value: string;
  @Expose() importance: number;
  @Expose() visibility: string;

  static fromUserPreference(pref: any): PreferenceDetailDto {
    const dto = new PreferenceDetailDto();
    dto.id = pref.preferenceId;
    dto.category = pref.preference?.category || '';
    dto.label = pref.preference?.label || '';
    dto.value = pref.preference?.value || '';
    dto.importance = pref.importance;
    dto.visibility = pref.visibility;
    return dto;
  }
}

//* Full Profile Details Response
@Exclude()
export class ProfileDetailsDto {
  @Expose() id: string;
  @Expose() email: string;
  
  @Expose() age?: number;
  @Expose() major?: string;
  @Expose() year?: string;
  @Expose() bio?: string;
  
  @Expose()
  @Type(() => PreferenceDetailDto)
  lifestylePreferences: PreferenceDetailDto[];
  
  @Expose()
  @Type(() => PreferenceDetailDto)
  roommatePreferences: PreferenceDetailDto[];

  // Favorite status - whether the viewer has favorited this profile
  @Expose() isFavoritedByMe?: boolean;

  static fromProfile(profile: any, isFavoritedByMe?: boolean): ProfileDetailsDto {
    const dto = new ProfileDetailsDto();
    dto.id = profile.id;
    dto.email = profile.email;
    // TODO: Map username, firstName, lastName, profileImage when available
    dto.age = profile.age;
    dto.major = profile.major;
    dto.year = profile.year;
    dto.bio = profile.bio;
    
    // Map lifestyle preferences (only PUBLIC ones if viewerId is different)
    dto.lifestylePreferences = (profile.profilePreferences || [])
      .map((p: any) => PreferenceDetailDto.fromUserPreference(p));
    
    // Map roommate preferences (only PUBLIC ones if viewerId is different)
    dto.roommatePreferences = (profile.roommatePreferences || [])
      .map((p: any) => PreferenceDetailDto.fromUserPreference(p));
    
    // Set favorite status
    dto.isFavoritedByMe = isFavoritedByMe || false;
    
    return dto;
  }
}

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

//* Get Favorites Response DTO (same structure as SearchUsersResponseDto)
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
