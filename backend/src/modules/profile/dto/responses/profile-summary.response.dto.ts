/**
 * Profile Summary Response DTO
 * Used in search results, favorites list, votes list
 */

import { Exclude, Expose } from 'class-transformer';

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

  // Vote counts - how many likes/dislikes this user has received
  @Expose() likesReceived?: number;
  @Expose() dislikesReceived?: number;

  static fromProfile(
    profile: any, 
    isFavoritedByMe?: boolean,
    likesReceived?: number,
    dislikesReceived?: number
  ): ProfileSummaryDto {
    const dto = new ProfileSummaryDto();
    dto.id = profile.id;
    dto.email = profile.email;
    dto.age = profile.age;
    dto.major = profile.major;
    dto.year = profile.year;
    dto.bio = profile.bio;
    dto.lifestylePreferencesCount = profile._count?.profilePreferences || 0;
    dto.roommatePreferencesCount = profile._count?.roommatePreferences || 0;
    dto.isFavoritedByMe = isFavoritedByMe || false;
    dto.likesReceived = likesReceived;
    dto.dislikesReceived = dislikesReceived;
    return dto;
  }
}
