/**
 * Profile Interfaces
 * Defines types for user profile data and roommate matching
 */

//* User Profile Summary (for listing/searching view)
export interface ProfileSummary {
  id: string;
  email: string;
  // TODO: Add username, firstName, lastName, profileImage when available
  // Basic info
  age?: number;
  major?: string;
  year?: string;
  bio?: string;
  
  // Lifestyle preferences count (not full details)
  lifestylePreferencesCount: number;
  roommatePreferencesCount: number;
  
  // Favorite status - whether current user has favorited this profile
  isFavoritedByMe?: boolean;
}

//* User Profile Full Details (for profile/:userId view)
export interface ProfileDetails {
  id: string;
  email: string;
  // TODO: Add username, firstName, lastName, profileImage when available
  
  // Basic info
  age?: number;
  major?: string;
  year?: string;
  bio?: string;
  
  // Lifestyle preferences (I am...)
  lifestylePreferences: {
    id: string;
    category: string;
    label: string;
    value: string;
    importance: number;
    visibility: string;
  }[];
  
  // Roommate preferences (I want...)
  roommatePreferences: {
    id: string;
    category: string;
    label: string;
    value: string;
    importance: number;
    visibility: string;
  }[];
}

//* Get Profile Details
export interface GetProfileDetailsRequest {
  userId: string; // The user to view
  viewerId?: string; // Optional: the user viewing (for privacy filtering)
}

//* Search Users Request
export interface SearchUsersRequest {
  userId: string; // Current user ID (to exclude from results)
  page?: number; // Pagination page (default 1)
  limit?: number; // Items per page (default 20)
  
  // Filter by user's lifestyle preferences matching current user's roommate preferences
  preferenceIds?: string[]; // Preference IDs to filter by
  importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal'; // How to compare importance
  importanceValue?: number; // Importance value to compare (1-5)
}

export interface SearchUsersResponse {
  profiles: ProfileSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

//* Add Favorite Request
export interface AddFavoriteRequest {
  userId: string; // Current user ID (who is favoriting)
  favoritedUserId: string; // User being favorited
}

//* Remove Favorite Request
export interface RemoveFavoriteRequest {
  userId: string; // Current user ID (who is unfavoriting)
  favoritedUserId: string; // User being unfavorited
}

//* Get Favorites Request
export interface GetFavoritesRequest {
  userId: string; // Current user ID
  page?: number; // Pagination page (default 1)
  limit?: number; // Items per page (default 20)
}

//* Get Favorites Response
export interface GetFavoritesResponse {
  favorites: ProfileSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
