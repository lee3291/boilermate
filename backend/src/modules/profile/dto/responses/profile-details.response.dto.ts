/**
 * Profile Details Response DTO
 * Used when viewing full profile of a user
 */

import { Exclude, Expose, Type } from 'class-transformer';

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
  @Expose() legalName?: string;
  @Expose() phoneNumber?: string;
  @Expose() avatarURL?: string;
  @Expose() searchStatus?: string;
  @Expose() id: string;
  @Expose() email: string;
  @Expose() isVerified?: boolean;

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

  // Vote status - viewer's vote on this profile
  @Expose() myVoteType?: 'LIKE' | 'DISLIKE' | null;

  // Vote counts - how many likes/dislikes this user has received
  @Expose() likesReceived?: number;
  @Expose() dislikesReceived?: number;

  static fromProfile(
    profile: any,
    isFavoritedByMe?: boolean,
    myVoteType?: 'LIKE' | 'DISLIKE' | null,
    likesReceived?: number,
    dislikesReceived?: number,
  ): ProfileDetailsDto {
    const dto = new ProfileDetailsDto();
    dto.id = profile.id;
    dto.email = profile.email;
    dto.age = profile.age;
    dto.major = profile.major;
    dto.year = profile.year;
    dto.bio = profile.bio;
    dto.legalName = profile.legalName;
    dto.phoneNumber = profile.phoneNumber;
    dto.avatarURL = profile.avatarURL;
    dto.searchStatus = profile.searchStatus;
    dto.isVerified = profile.isVerified;

    dto.lifestylePreferences = (profile.profilePreferences || []).map(
      (p: any) => PreferenceDetailDto.fromUserPreference(p),
    );

    dto.roommatePreferences = (profile.roommatePreferences || []).map(
      (p: any) => PreferenceDetailDto.fromUserPreference(p),
    );

    dto.isFavoritedByMe = isFavoritedByMe || false;
    dto.myVoteType = myVoteType || null;
    dto.likesReceived = likesReceived;
    dto.dislikesReceived = dislikesReceived;

    return dto;
  }
}
