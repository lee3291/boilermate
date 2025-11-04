import { useState, useEffect, useCallback } from 'react';
import { searchUsers, getFavorites, toggleFavorite } from '@/services/profileService';
import { getPreferences } from '@/services/preferencesService';
import type { ProfileSummary, SearchUsersResponse, GetFavoritesResponse } from '@/types/profile';
import type { GetPreferencesResponse } from '@/types/preferences/preference';

const PAGE_SIZE = 9; // 3x3 grid

export default function useRoommatesLogic(initialUserId: string) {
  const [currentUserId] = useState<string>(initialUserId);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // View mode: 'search' or 'favorites'
  const [viewMode, setViewMode] = useState<'search' | 'favorites'>('search');
  
  // Preference filtering
  const [allPreferences, setAllPreferences] = useState<GetPreferencesResponse>({ preferences: [] });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [importanceOperator, setImportanceOperator] = useState<'equal' | 'less_or_equal' | 'greater_or_equal'>('greater_or_equal');
  const [importanceValue, setImportanceValue] = useState<number>(3);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch master preference list
  useEffect(() => {
    const fetchPreferencesList = async () => {
      try {
        const prefs = await getPreferences();
        setAllPreferences(prefs);
      } catch (err) {
        console.error('Error fetching preferences:', err);
      }
    };
    fetchPreferencesList();
  }, []);

  // Fetch profiles based on view mode
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (viewMode === 'favorites') {
        // Fetch favorites
        const response: GetFavoritesResponse = await getFavorites({
          userId: currentUserId,
          page,
          limit: PAGE_SIZE,
        });
        
        setProfiles(response.favorites);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } else {
        // Fetch search results
        const response: SearchUsersResponse = await searchUsers({
          userId: currentUserId,
          page,
          limit: PAGE_SIZE,
          preferenceIds: selectedPreferences.length > 0 ? selectedPreferences : undefined,
          importanceOperator: selectedPreferences.length > 0 ? importanceOperator : undefined,
          importanceValue: selectedPreferences.length > 0 ? importanceValue : undefined,
        });
        
        setProfiles(response.profiles);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, page, selectedPreferences, importanceOperator, importanceValue, viewMode]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleClearFilters = useCallback(() => {
    setSelectedPreferences([]);
    setImportanceOperator('greater_or_equal');
    setImportanceValue(3);
    setPage(1);
  }, []);

  const handleToggleFavorite = useCallback(async (profileId: string, isFavorited: boolean) => {
    try {
      await toggleFavorite(currentUserId, profileId, isFavorited);
      
      // Update the profile in the current list
      setProfiles(prevProfiles =>
        prevProfiles.map(p =>
          p.id === profileId
            ? { ...p, isFavoritedByMe: !isFavorited }
            : p
        )
      );
      
      // If in favorites view and removing favorite, also remove from list
      if (viewMode === 'favorites' && isFavorited) {
        setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));
        // Update total count
        setTotal(prev => prev - 1);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status');
    }
  }, [currentUserId, viewMode]);

  const handleTogglePreference = useCallback((prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
    setPage(1); // Reset to first page when filter changes
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const handleSetViewMode = useCallback((mode: 'search' | 'favorites') => {
    setViewMode(mode);
    setPage(1);
  }, []);

  const handleSetImportanceOperator = useCallback((operator: 'equal' | 'less_or_equal' | 'greater_or_equal') => {
    setImportanceOperator(operator);
    setPage(1);
  }, []);

  const handleSetImportanceValue = useCallback((value: number) => {
    setImportanceValue(value);
    setPage(1);
  }, []);

  return {
    // state
    currentUserId,
    profiles,
    loading,
    error,
    page,
    totalPages,
    total,
    viewMode,
    allPreferences,
    selectedPreferences,
    importanceOperator,
    importanceValue,
    expandedCategories,

    // actions
    setPage,
    handleSetViewMode,
    handleClearFilters,
    handleToggleFavorite,
    handleTogglePreference,
    handleToggleCategory,
    handleSetImportanceOperator,
    handleSetImportanceValue,
  };
}
