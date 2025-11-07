/**
 * Interfaces for Preferences Module
 * Defines types for fetching master preferences and managing user preference selections
 */

//* Master Preference Interfaces
export interface PreferenceDetails {
  id: string;
  category: string;
  label: string;
  value: string;
  mustHave: boolean;
}

export interface GetPreferencesResults {
  preferences: PreferenceDetails[];
}

//* User Profile Preference Interfaces ("I am...")
export interface UserProfilePreferenceDetails {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: PreferenceDetails; // Optional expanded preference data
}

export interface SetUserProfilePreferenceDetails {
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
}

export interface UpdateUserProfilePreferenceDetails {
  userId: string;
  preferenceId: string;
  importance?: number; // Optional - only update if provided
  visibility?: string; // Optional - only update if provided
}

export interface GetUserProfilePreferencesDetails {
  userId: string;
}

export interface GetUserProfilePreferencesResults {
  preferences: UserProfilePreferenceDetails[];
}

//* Roommate Preference Interfaces ("I want...")
export interface RoommatePreferenceDetails {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: PreferenceDetails; // Optional expanded preference data
}

export interface SetRoommatePreferenceDetails {
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
}

export interface UpdateRoommatePreferenceDetails {
  userId: string;
  preferenceId: string;
  importance?: number; // Optional - only update if provided
  visibility?: string; // Optional - only update if provided
}

export interface GetRoommatePreferencesDetails {
  userId: string;
}

export interface GetRoommatePreferencesResults {
  preferences: RoommatePreferenceDetails[];
}

//* Delete Preference Interfaces
export interface DeleteUserProfilePreferenceDetails {
  userId: string;
  preferenceId: string;
}

export interface DeleteRoommatePreferenceDetails {
  userId: string;
  preferenceId: string;
}
