import type { SearchStatus } from '@/types/user';

export interface UpdateProfileDto {
  phoneNumber?: string;
  bio?: string;
  searchStatus?: SearchStatus;
  lifestyleHashtags?: string[];
  isSmoker?: boolean;
  hasPets?: boolean;
}

export interface ProfileData extends UpdateProfileDto {
  username: string;
  email: string;
  avatarURL?: string;
}
