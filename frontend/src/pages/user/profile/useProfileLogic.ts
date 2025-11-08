/**
 * useProfileLogic - Custom hook for profile page
 * Manages state and logic for:
 * - User profile data (name, bio, avatar, stats)
 * - User profile preferences (I am...)
 * - Roommate preferences (I want...)
 * - Vote stats (likes/dislikes received)
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Preference,
  UserProfilePreference,
  RoommatePreference,
} from '@/types/preferences/preference';
import * as preferencesService from '@/services/preferencesService';
import * as profileService from '@/services/profileService';

export default function useProfileLogic(userId: string) {
  // Profile data (from /profile/me endpoint)
  const [profileData, setProfileData] = useState<any>(null);

  // Vote stats (likes/dislikes received)
  const [voteStats, setVoteStats] = useState<{
    likesReceived: number;
    dislikesReceived: number;
  }>({ likesReceived: 0, dislikesReceived: 0 });

  // Master preferences list (all available options)
  const [allPreferences, setAllPreferences] = useState<Preference[]>([]);

  // User's selected preferences
  const [userProfilePreferences, setUserProfilePreferences] = useState<
    UserProfilePreference[]
  >([]);
  const [roommatePreferences, setRoommatePreferences] = useState<
    RoommatePreference[]
  >([]);

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingMasterList, setLoadingMasterList] = useState(false);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  const [loadingRoommate, setLoadingRoommate] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current user's profile data including vote stats
   * Uses /profile/me endpoint which returns ProfileDetailsDto with likesReceived/dislikesReceived
   */
  const fetchMyProfile = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoadingProfile(true);
    setError(null);
    try {
      const response = await profileService.getMyProfile(userId);
      setProfileData(response);

      // Extract vote stats from response
      setVoteStats({
        likesReceived: response.likesReceived || 0,
        dislikesReceived: response.dislikesReceived || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

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
      const response =
        await preferencesService.getUserProfilePreferences(userId);
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
      setError(null);
      try {
        await preferencesService.setUserProfilePreference({
          userId,
          preferenceId,
          visibility,
          importance,
        });
        await fetchUserProfilePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to set user profile preference');
        console.error('Error setting user profile preference:', err);
      }
    },
    [userId, fetchUserProfilePreferences],
  );

  // Update user profile preference (importance/visibility only)
  const handleUpdateUserProfilePreference = useCallback(
    async (
      userProfilePreferenceId: string,
      importance: number,
      visibility: string,
    ) => {
      setError(null);
      try {
        await preferencesService.updateUserProfilePreference(
          userId,
          userProfilePreferenceId,
          {
            visibility,
            importance,
          },
        );
        await fetchUserProfilePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to update user profile preference');
        console.error('Error updating user profile preference:', err);
      }
    },
    [userId, fetchUserProfilePreferences],
  );

  // Remove user profile preference
  const handleDeleteUserProfilePreference = useCallback(
    async (userProfilePreferenceId: string) => {
      setError(null);
      try {
        await preferencesService.deleteUserProfilePreference(
          userId,
          userProfilePreferenceId,
        );
        await fetchUserProfilePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete user profile preference');
        console.error('Error deleting user profile preference:', err);
      }
    },
    [userId, fetchUserProfilePreferences],
  );

  // Add/Update roommate preference
  const handleSetRoommatePreference = useCallback(
    async (preferenceId: string, importance: number, visibility: string) => {
      if (!userId) return;
      try {
        await preferencesService.setRoommatePreference({
          userId: userId,
          preferenceId,
          importance,
          visibility,
        });
        // Refresh the list
        await fetchRoommatePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to set preference');
        console.error('Error setting roommate preference:', err);
      }
    },
    [userId, fetchRoommatePreferences],
  );

  // Update roommate preference (importance/visibility only)
  const handleUpdateRoommatePreference = useCallback(
    async (
      roommatePreferenceId: string,
      importance: number,
      visibility: string,
    ) => {
      setError(null);
      try {
        await preferencesService.updateRoommatePreference(
          userId,
          roommatePreferenceId,
          {
            visibility,
            importance,
          },
        );
        await fetchRoommatePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to update roommate preference');
        console.error('Error updating roommate preference:', err);
      }
    },
    [userId, fetchRoommatePreferences],
  );

  // Remove roommate preference
  const handleDeleteRoommatePreference = useCallback(
    async (preferenceId: string) => {
      if (!userId) return;
      try {
        await preferencesService.deleteRoommatePreference(userId, preferenceId);
        // Refresh the list
        await fetchRoommatePreferences(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete preference');
        console.error('Error deleting roommate preference:', err);
      }
    },
    [userId, fetchRoommatePreferences],
  );

  // Initialize: Load master preferences on mount
  useEffect(() => {
    fetchAllPreferences();
  }, [fetchAllPreferences]);

  // Load user data when userId changes
  useEffect(() => {
    fetchMyProfile(userId);
    fetchUserProfilePreferences(userId);
    fetchRoommatePreferences(userId);
  }, [
    userId,
    fetchMyProfile,
    fetchUserProfilePreferences,
    fetchRoommatePreferences,
  ]);

  /**
   * Handle avatar file change
   * TODO: Implement AWS S3 upload logic here
   * For now, just logs the file
   */
  const handleAvatarChange = useCallback(async (file: File) => {
    if (!file || !userId) return;
    setError(null);
    try {
      // 1. Get pre-signed URL from backend
      const { getPresignedUrl, uploadFileToS3 } = await import(
        '@/services/uploadService'
      );
      const { preSignedUrl, key } = await getPresignedUrl({
        contentType: file.type,
        userId,
      });

      // 2. Upload file to S3
      await uploadFileToS3(preSignedUrl, file);

      // 3. Update avatar URL in backend
      await profileService.updateAvatar(userId, key);

      // 4. Refresh profile data
      await fetchMyProfile(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
      console.error('Error uploading avatar:', err);
    }
  }, []);

  return {
    // State
    profileData,
    voteStats,
    allPreferences,
    userProfilePreferences,
    roommatePreferences,
    loadingProfile,
    loadingMasterList,
    loadingUserProfile,
    loadingRoommate,
    error,

    // Actions
    fetchAllPreferences,
    fetchMyProfile,
    handleAvatarChange,
    handleSetUserProfilePreference,
    handleUpdateUserProfilePreference,
    handleDeleteUserProfilePreference,
    handleSetRoommatePreference,
    handleUpdateRoommatePreference,
    handleDeleteRoommatePreference,
  };
}
