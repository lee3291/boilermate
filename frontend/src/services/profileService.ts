/**
 * Profile Service
 * Handles API calls for profile viewing and roommate searching
 */

import api from './api';
import type { 
  ProfileDetails, 
  SearchUsersResponse,
  GetProfileDetailsRequest,
  SearchUsersRequest,
  GetFavoritesRequest,
  GetFavoritesResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteRequest,
  RemoveFavoriteResponse
} from '../types/profile';

const BASE_URL = '/profile';

/**
 * Get current user's profile
 * TODO: Will be fully implemented when user basic fields are available
 */
export const getMyProfile = async (): Promise<any> => {
  const response = await api.get(`${BASE_URL}/me`);
  return response.data;
};

/**
 * Get full profile details for a specific user
 * Includes lifestyle and roommate preferences
 */
export const getProfileDetails = async (
  request: GetProfileDetailsRequest
): Promise<ProfileDetails> => {
  const { userId, viewerId } = request;
  
  const params = viewerId ? { viewerId } : {};
  
  const response = await api.get(`${BASE_URL}/${userId}`, { params });
  return response.data;
};

/**
 * Search for users based on lifestyle preferences
 * Filters by preference IDs and importance levels
 */
export const searchUsers = async (
  request: SearchUsersRequest
): Promise<SearchUsersResponse> => {
  const { userId, page = 1, limit = 10, preferenceIds, importanceOperator, importanceValue } = request;
  
  const params: any = { userId, page, limit };
  
  if (preferenceIds && preferenceIds.length > 0) {
    params.preferenceIds = preferenceIds;
  }
  
  if (importanceOperator) {
    params.importanceOperator = importanceOperator;
  }
  
  if (importanceValue !== undefined) {
    params.importanceValue = importanceValue;
  }
  
  const response = await api.get(`${BASE_URL}/search`, { params });
  return response.data;
};

/**
 * Get all favorites for current user
 * Returns a paginated list of favorited users
 */
export const getFavorites = async (
  request: GetFavoritesRequest
): Promise<GetFavoritesResponse> => {
  const { userId, page = 1, limit = 20 } = request;
  
  const params = { userId, page, limit };
  
  const response = await api.get(`${BASE_URL}/favorites/list`, { params });
  return response.data;
};

/**
 * Add a user to favorites
 */
export const addFavorite = async (
  request: AddFavoriteRequest
): Promise<AddFavoriteResponse> => {
  const response = await api.post(`${BASE_URL}/favorites`, request);
  return response.data;
};

/**
 * Remove a user from favorites
 */
export const removeFavorite = async (
  request: RemoveFavoriteRequest
): Promise<RemoveFavoriteResponse> => {
  const { userId, favoritedUserId } = request;
  
  const params = { userId };
  
  const response = await api.delete(`${BASE_URL}/favorites/${favoritedUserId}`, { params });
  return response.data;
};

/**
 * Toggle favorite status for a user
 * Convenience function that adds or removes based on current status
 */
export const toggleFavorite = async (
  userId: string,
  favoritedUserId: string,
  isFavorited: boolean
): Promise<void> => {
  console.log('toggleFavorite called:', { userId, favoritedUserId, isFavorited });
  
  if (isFavorited) {
    console.log('Removing favorite...');
    await removeFavorite({ userId, favoritedUserId });
  } else {
    console.log('Adding favorite...');
    await addFavorite({ userId, favoritedUserId });
  }
  
  console.log('toggleFavorite completed successfully');
};
