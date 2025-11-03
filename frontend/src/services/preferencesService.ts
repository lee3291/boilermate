/**
 * Preferences Service - Following chatService.ts pattern
 * Handles API calls for user preferences (I am...) and roommate preferences (I want...)
 */

import axios from 'axios';
import type {
  GetPreferencesResponse,
  GetUserProfilePreferencesResponse,
  SetUserProfilePreferenceRequest,
  SetUserProfilePreferenceResponse,
  UpdateUserProfilePreferenceRequest,
  UpdateUserProfilePreferenceResponse,
  GetRoommatePreferencesResponse,
  SetRoommatePreferenceRequest,
  SetRoommatePreferenceResponse,
  UpdateRoommatePreferenceRequest,
  UpdateRoommatePreferenceResponse,
} from '../types/preferences/preference';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Get all available preferences (master list)
 * Used to populate preference selection UI
 */
export async function getPreferences(): Promise<GetPreferencesResponse> {
  try {
    const res = await api.get('/preferences');
    console.log('get preferences', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Get user profile preferences (I am...)
 * Fetches all preferences the user has selected to describe themselves
 */
export async function getUserProfilePreferences(
  userId: string
): Promise<GetUserProfilePreferencesResponse> {
  try {
    const res = await api.get(`/preferences/profile/${encodeURIComponent(userId)}`);
    console.log('get user profile preferences', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching user profile preferences:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Set/Update user profile preference (I am...)
 * Creates or updates a single preference for the user's profile
 */
export async function setUserProfilePreference(
  request: SetUserProfilePreferenceRequest
): Promise<SetUserProfilePreferenceResponse> {
  try {
    const res = await api.post('/preferences/profile', request);
    console.log('set user profile preference', res);
    return res.data;
  } catch (error: any) {
    console.error('Error setting user profile preference:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Update user profile preference (I am...)
 * Updates only importance and/or visibility for an existing preference
 */
export async function updateUserProfilePreference(
  userId: string,
  preferenceId: string,
  request: UpdateUserProfilePreferenceRequest
): Promise<UpdateUserProfilePreferenceResponse> {
  try {
    const res = await api.patch(
      `/preferences/profile/${encodeURIComponent(userId)}/${encodeURIComponent(preferenceId)}`,
      request
    );
    console.log('update user profile preference', res);
    return res.data;
  } catch (error: any) {
    console.error('Error updating user profile preference:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Delete user profile preference (I am...)
 * Removes a preference from the user's profile
 */
export async function deleteUserProfilePreference(
  userId: string,
  preferenceId: string
): Promise<void> {
  try {
    await api.delete(`/preferences/profile/${encodeURIComponent(userId)}/${encodeURIComponent(preferenceId)}`);
    console.log('delete user profile preference');
  } catch (error: any) {
    console.error('Error deleting user profile preference:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Get roommate preferences (I want...)
 * Fetches all preferences the user has specified for their ideal roommate
 */
export async function getRoommatePreferences(
  userId: string
): Promise<GetRoommatePreferencesResponse> {
  try {
    const res = await api.get(`/preferences/roommate/${encodeURIComponent(userId)}`);
    console.log('get roommate preferences', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching roommate preferences:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Set/Update roommate preference (I want...)
 * Creates or updates a single preference for what the user wants in a roommate
 */
export async function setRoommatePreference(
  request: SetRoommatePreferenceRequest
): Promise<SetRoommatePreferenceResponse> {
  try {
    const res = await api.post('/preferences/roommate', request);
    console.log('set roommate preference', res);
    return res.data;
  } catch (error: any) {
    console.error('Error setting roommate preference:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Update roommate preference (I want...)
 * Updates only importance and/or visibility for an existing preference
 */
export async function updateRoommatePreference(
  userId: string,
  preferenceId: string,
  request: UpdateRoommatePreferenceRequest
): Promise<UpdateRoommatePreferenceResponse> {
  try {
    const res = await api.patch(
      `/preferences/roommate/${encodeURIComponent(userId)}/${encodeURIComponent(preferenceId)}`,
      request
    );
    console.log('update roommate preference', res);
    return res.data;
  } catch (error: any) {
    console.error('Error updating roommate preference:', error);
    throw error.response?.data ?? error;
  }
}

/**
 * Delete roommate preference (I want...)
 * Removes a preference from what the user wants in a roommate
 */
export async function deleteRoommatePreference(
  userId: string,
  preferenceId: string
): Promise<void> {
  try {
    await api.delete(`/preferences/roommate/${encodeURIComponent(userId)}/${encodeURIComponent(preferenceId)}`);
    console.log('delete roommate preference');
  } catch (error: any) {
    console.error('Error deleting roommate preference:', error);
    throw error.response?.data ?? error;
  }
}

export default {
  getPreferences,
  getUserProfilePreferences,
  setUserProfilePreference,
  updateUserProfilePreference,
  deleteUserProfilePreference,
  getRoommatePreferences,
  setRoommatePreference,
  updateRoommatePreference,
  deleteRoommatePreference,
};
