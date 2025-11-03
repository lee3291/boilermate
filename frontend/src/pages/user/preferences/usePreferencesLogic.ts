/**
 * usePreferencesLogic - Custom hook for preferences page
 * Manages state and logic for user profile preferences (I am...) and roommate preferences (I want...)
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Preference,
  UserProfilePreference,
  RoommatePreference,
} from '@/types/preferences/preference';
import * as preferencesService from '@/services/preferencesService';

export default function usePreferencesLogic(initialUserId: string) {
  // User state
  const [currentUserId, setCurrentUserId] = useState<string>(initialUserId);

  // Master preferences list (all available options)
  const [allPreferences, setAllPreferences] = useState<Preference[]>([]);

  // User's selected preferences
  const [userProfilePreferences, setUserProfilePreferences] = useState<UserProfilePreference[]>([]);
  const [roommatePreferences, setRoommatePreferences] = useState<RoommatePreference[]>([]);

  // Loading states
  const [loadingMasterList, setLoadingMasterList] = useState(false);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  const [loadingRoommate, setLoadingRoommate] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch all available preferences (master list)
  const fetchAllPreferences = useCallback(async () => {
    setLoadingMasterList(true);
    setError(null);
    try {
      const response = await preferencesService.getPreferences();
      setAllPreferences(response.preferences);
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoadingMasterList(false);
    }
  }, []);

  // Fetch user profile preferences (I am...)
  const fetchUserProfilePreferences = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoadingUserProfile(true);
    setError(null);
    try {
      const response = await preferencesService.getUserProfilePreferences(userId);
      setUserProfilePreferences(response.preferences);
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile preferences');
      console.error('Error fetching user profile preferences:', err);
    } finally {
      setLoadingUserProfile(false);
    }
  }, []);

  // Fetch roommate preferences (I want...)
  const fetchRoommatePreferences = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoadingRoommate(true);
    setError(null);
    try {
      const response = await preferencesService.getRoommatePreferences(userId);
      setRoommatePreferences(response.preferences);
    } catch (err: any) {
      setError(err.message || 'Failed to load roommate preferences');
      console.error('Error fetching roommate preferences:', err);
    } finally {
      setLoadingRoommate(false);
    }
  }, []);

  // Add/Update user profile preference
  const handleSetUserProfilePreference = useCallback(
    async (preferenceId: string, importance: number, visibility: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.setUserProfilePreference({
          userId: currentUserId,
          preferenceId,
          importance,
          visibility,
        });
        // Refresh the list
        await fetchUserProfilePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to set preference');
        console.error('Error setting user profile preference:', err);
      }
    },
    [currentUserId, fetchUserProfilePreferences]
  );

  // Update user profile preference (importance/visibility only)
  const handleUpdateUserProfilePreference = useCallback(
    async (preferenceId: string, importance?: number, visibility?: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.updateUserProfilePreference(currentUserId, preferenceId, {
          importance,
          visibility,
        });
        // Refresh the list
        await fetchUserProfilePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to update preference');
        console.error('Error updating user profile preference:', err);
      }
    },
    [currentUserId, fetchUserProfilePreferences]
  );

  // Remove user profile preference
  const handleDeleteUserProfilePreference = useCallback(
    async (preferenceId: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.deleteUserProfilePreference(currentUserId, preferenceId);
        // Refresh the list
        await fetchUserProfilePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete preference');
        console.error('Error deleting user profile preference:', err);
      }
    },
    [currentUserId, fetchUserProfilePreferences]
  );

  // Add/Update roommate preference
  const handleSetRoommatePreference = useCallback(
    async (preferenceId: string, importance: number, visibility: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.setRoommatePreference({
          userId: currentUserId,
          preferenceId,
          importance,
          visibility,
        });
        // Refresh the list
        await fetchRoommatePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to set preference');
        console.error('Error setting roommate preference:', err);
      }
    },
    [currentUserId, fetchRoommatePreferences]
  );

  // Update roommate preference (importance/visibility only)
  const handleUpdateRoommatePreference = useCallback(
    async (preferenceId: string, importance?: number, visibility?: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.updateRoommatePreference(currentUserId, preferenceId, {
          importance,
          visibility,
        });
        // Refresh the list
        await fetchRoommatePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to update preference');
        console.error('Error updating roommate preference:', err);
      }
    },
    [currentUserId, fetchRoommatePreferences]
  );

  // Remove roommate preference
  const handleDeleteRoommatePreference = useCallback(
    async (preferenceId: string) => {
      if (!currentUserId) return;
      try {
        await preferencesService.deleteRoommatePreference(currentUserId, preferenceId);
        // Refresh the list
        await fetchRoommatePreferences(currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete preference');
        console.error('Error deleting roommate preference:', err);
      }
    },
    [currentUserId, fetchRoommatePreferences]
  );

  // Initialize: Load master preferences on mount
  useEffect(() => {
    fetchAllPreferences();
  }, [fetchAllPreferences]);

  // Load user data when userId changes
  useEffect(() => {
    if (currentUserId) {
      fetchUserProfilePreferences(currentUserId);
      fetchRoommatePreferences(currentUserId);
    }
  }, [currentUserId, fetchUserProfilePreferences, fetchRoommatePreferences]);

  return {
    // State
    currentUserId,
    setCurrentUserId,
    allPreferences,
    userProfilePreferences,
    roommatePreferences,
    loadingMasterList,
    loadingUserProfile,
    loadingRoommate,
    error,

    // Actions
    fetchAllPreferences,
    handleSetUserProfilePreference,
    handleUpdateUserProfilePreference,
    handleDeleteUserProfilePreference,
    handleSetRoommatePreference,
    handleUpdateRoommatePreference,
    handleDeleteRoommatePreference,
  };
}
