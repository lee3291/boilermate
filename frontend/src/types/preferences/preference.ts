//* Preference Types - Following chat.ts pattern

// Master preference details
export interface Preference {
  id: string;
  category: string; // LIFESTYLE, SOCIAL, HABITS, etc.
  label: string; // Human-readable label
  value: string; // Enum value
  mustHave: boolean; // Is this required by the app?
}

// User profile preference (I am...)
export interface UserProfilePreference {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
  preference?: Preference; // Expanded preference data
}

// Roommate preference (I want...)
export interface RoommatePreference {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
  preference?: Preference; // Expanded preference data
}

//* API Request/Response Types

// Get all available preferences (master list)
export interface GetPreferencesResponse {
  preferences: Preference[];
}

// Get user profile preferences
export interface GetUserProfilePreferencesResponse {
  preferences: UserProfilePreference[];
}

// Set/Update user profile preference
export interface SetUserProfilePreferenceRequest {
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
}

export interface SetUserProfilePreferenceResponse {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: Preference;
}

// Update user profile preference (only importance/visibility)
export interface UpdateUserProfilePreferenceRequest {
  importance?: number; // 1-5 (optional)
  visibility?: string; // PUBLIC or PRIVATE (optional)
}

export interface UpdateUserProfilePreferenceResponse {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: Preference;
}

// Get roommate preferences
export interface GetRoommatePreferencesResponse {
  preferences: RoommatePreference[];
}

// Set/Update roommate preference
export interface SetRoommatePreferenceRequest {
  userId: string;
  preferenceId: string;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
}

export interface SetRoommatePreferenceResponse {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: Preference;
}

// Update roommate preference (only importance/visibility)
export interface UpdateRoommatePreferenceRequest {
  importance?: number; // 1-5 (optional)
  visibility?: string; // PUBLIC or PRIVATE (optional)
}

export interface UpdateRoommatePreferenceResponse {
  id: string;
  userId: string;
  preferenceId: string;
  importance: number;
  visibility: string;
  preference?: Preference;
}
