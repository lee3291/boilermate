/**
 * Compare Profiles Grouped Response DTO
 * Used when comparing multiple user profiles with preferences grouped by category
 */

import { Exclude, Expose, Type } from 'class-transformer';

//* Grouped Preference Detail (without redundant category field)
@Exclude()
export class GroupedPreferenceDetailDto {
  @Expose() id: string;
  @Expose() label: string;
  @Expose() value: string;
  @Expose() importance: number;
  @Expose() visibility: string;

  static fromUserPreference(pref: any): GroupedPreferenceDetailDto {
    const dto = new GroupedPreferenceDetailDto();
    dto.id = pref.preferenceId;
    dto.label = pref.preference?.label || '';
    dto.value = pref.preference?.value || '';
    dto.importance = pref.importance;
    dto.visibility = pref.visibility;
    return dto;
  }
}

//* Profile with Grouped Preferences
@Exclude()
export class CompareProfileDto {
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

  // Preferences grouped by category: { "Sleep Schedule": [...], "Cleanliness": [...] }
  @Expose() lifestyleByCategory: Record<string, GroupedPreferenceDetailDto[]>;
  @Expose() roommatePreferencesByCategory: Record<string, GroupedPreferenceDetailDto[]>;

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
  ): CompareProfileDto {
    const dto = new CompareProfileDto();
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

    // Group lifestyle preferences by category
    dto.lifestyleByCategory = {};
    (profile.profilePreferences || []).forEach((p: any) => {
      const category = p.preference?.category || 'Other';
      if (!dto.lifestyleByCategory[category]) {
        dto.lifestyleByCategory[category] = [];
      }
      dto.lifestyleByCategory[category].push(
        GroupedPreferenceDetailDto.fromUserPreference(p),
      );
    });

    // Group roommate preferences by category
    dto.roommatePreferencesByCategory = {};
    (profile.roommatePreferences || []).forEach((p: any) => {
      const category = p.preference?.category || 'Other';
      if (!dto.roommatePreferencesByCategory[category]) {
        dto.roommatePreferencesByCategory[category] = [];
      }
      dto.roommatePreferencesByCategory[category].push(
        GroupedPreferenceDetailDto.fromUserPreference(p),
      );
    });

    dto.isFavoritedByMe = isFavoritedByMe || false;
    dto.myVoteType = myVoteType || null;
    dto.likesReceived = likesReceived;
    dto.dislikesReceived = dislikesReceived;

    return dto;
  }
}

//* Compare Profiles Grouped Response
@Exclude()
export class CompareProfilesGroupedResponseDto {
  @Expose()
  @Type(() => CompareProfileDto)
  profiles: CompareProfileDto[];

  @Expose()
  count: number;

  // Ordered list of all unique categories across all profiles
  @Expose()
  lifestyleCategories: string[];

  @Expose()
  roommateCategories: string[];

  static fromProfiles(profiles: CompareProfileDto[]): CompareProfilesGroupedResponseDto {
    const dto = new CompareProfilesGroupedResponseDto();
    dto.profiles = profiles;
    dto.count = profiles.length;

    // Extract all unique categories from all profiles (for lifestyle)
    const lifestyleCategoriesSet = new Set<string>();
    profiles.forEach((profile) => {
      Object.keys(profile.lifestyleByCategory).forEach((category) => {
        lifestyleCategoriesSet.add(category);
      });
    });
    dto.lifestyleCategories = Array.from(lifestyleCategoriesSet).sort();

    // Extract all unique categories from all profiles (for roommate)
    const roommateCategoriesSet = new Set<string>();
    profiles.forEach((profile) => {
      Object.keys(profile.roommatePreferencesByCategory).forEach((category) => {
        roommateCategoriesSet.add(category);
      });
    });
    dto.roommateCategories = Array.from(roommateCategoriesSet).sort();

    return dto;
  }
}
