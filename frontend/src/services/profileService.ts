/**
 * Profile Service
 * Handles API calls for profile viewing and roommate searching
 */

import api from './api';
import type { 
  ProfileDetails, 
  SearchUsersResponse,
  GetProfileDetailsRequest,
  SearchUsersRequest 
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
