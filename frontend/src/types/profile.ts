/**
 * Profile Types
 * Types for profile viewing and roommate searching
 */

//* Profile Summary (for listing/searching)
export interface ProfileSummary {
  id: string;
  email: string;

  age?: number;
  major?: string;
  year?: string;
  bio?: string;

  lifestylePreferencesCount: number;
  roommatePreferencesCount: number;

  // Favorite status - whether current user has favorited this profile
  isFavoritedByMe?: boolean;

  // Vote status - current user's vote on this profile (LIKE, DISLIKE, or null)
  myVoteType?: 'LIKE' | 'DISLIKE' | null;

  // Vote counts - how many likes/dislikes this user has received
  likesReceived?: number;
  dislikesReceived?: number;
}

//* Preference Detail (for full profile view)
export interface PreferenceDetail {
  id: string;
  category: string;
  label: string;
  value: string;
  importance: number;
  visibility: string;
}

//* Full Profile Details
export interface ProfileDetails {
  id: string;
  email: string;
  legalName?: string;
  phoneNumber?: string;
  avatarURL?: string;
  searchStatus?: string;
  isVerified?: boolean;
  name?: string;
  profileImage?: string;
  age?: number;
  major?: string;
  year?: string;
  bio?: string;
  lifestylePreferences: PreferenceDetail[];
  roommatePreferences: PreferenceDetail[];
  isFavoritedByMe?: boolean;
  myVoteType?: 'LIKE' | 'DISLIKE' | null;
  likesReceived?: number;
  dislikesReceived?: number;
}

//* Get Profile Details Request
export interface GetProfileDetailsRequest {
  userId: string;
  viewerId?: string;
}

//* Search Users Request
export interface SearchUsersRequest {
  userId: string;
  page?: number;
  limit?: number;
  preferenceIds?: string[];
  importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal';
  importanceValue?: number;
}

//* Search Users Response
export interface SearchUsersResponse {
  profiles: ProfileSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

//* Get Favorites Request
export interface GetFavoritesRequest {
  userId: string;
  page?: number;
  limit?: number;
}

//* Get Favorites Response
export interface GetFavoritesResponse {
  favorites: ProfileSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

//* Add Favorite Request
export interface AddFavoriteRequest {
  userId: string;
  favoritedUserId: string;
}

//* Add Favorite Response
export interface AddFavoriteResponse {
  message: string;
  favoriteId: string;
}

//* Remove Favorite Request
export interface RemoveFavoriteRequest {
  userId: string;
  favoritedUserId: string;
}

//* Remove Favorite Response
export interface RemoveFavoriteResponse {
  message: string;
}

//* Vote (Like/Dislike) Types
export interface VoteUserRequest {
  voterId: string;
  votedUserId: string;
  voteType: 'LIKE' | 'DISLIKE';
}

export interface VoteUserResponse {
  message: string;
  voteId: string;
  voteType: 'LIKE' | 'DISLIKE';
}

export interface RemoveVoteRequest {
  voterId: string;
  votedUserId: string;
}

export interface RemoveVoteResponse {
  message: string;
}

export interface GetMyVotesRequest {
  voterId: string;
  voteType?: 'LIKE' | 'DISLIKE';
  page?: number;
  limit?: number;
}

export interface GetMyVotesResponse {
  votes: ProfileSummary[];
  voteType?: 'LIKE' | 'DISLIKE';
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetVoteStatsRequest {
  userId: string;
}

export interface VoteStatsResponse {
  userId: string;
  likesReceived: number;
  dislikesReceived: number;
  totalVotes: number;
}

//* Compare Profiles Request
export interface CompareProfilesRequest {
  userIds: string[]; // Array of user IDs to compare
  viewerId?: string; // Optional viewer ID for favorite/vote status
}

//* Grouped Preference Detail (without redundant category field)
export interface GroupedPreferenceDetail {
  id: string;
  label: string;
  value: string;
  importance: number;
  visibility: string;
}

//* Compare Profile (with preferences grouped by category)
export interface CompareProfile {
  id: string;
  email: string;
  legalName?: string;
  phoneNumber?: string;
  avatarURL?: string;
  searchStatus?: string;
  isVerified?: boolean;
  age?: number;
  major?: string;
  year?: string;
  bio?: string;
  
  // Preferences grouped by category: { "Sleep Schedule": [...], "Cleanliness": [...] }
  lifestyleByCategory: Record<string, GroupedPreferenceDetail[]>;
  roommatePreferencesByCategory: Record<string, GroupedPreferenceDetail[]>;
  
  isFavoritedByMe?: boolean;
  myVoteType?: 'LIKE' | 'DISLIKE' | null;
  likesReceived?: number;
  dislikesReceived?: number;
}

//* Compare Profiles Response (with grouped data and category lists)
export interface CompareProfilesResponse {
  profiles: CompareProfile[];
  count: number;
  lifestyleCategories: string[]; // Ordered list of all lifestyle categories
  roommateCategories: string[]; // Ordered list of all roommate categories
}
