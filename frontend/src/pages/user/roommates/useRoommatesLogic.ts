import { useState, useEffect, useCallback } from 'react';
import { searchUsers, getFavorites, toggleFavorite, getMyVotes, toggleVote } from '@/services/profileService';
import { getPreferences } from '@/services/preferencesService';
import type { ProfileSummary, SearchUsersResponse, GetFavoritesResponse, GetMyVotesResponse } from '@/types/profile';
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
  
  // View mode: 'search', 'favorites', 'liked', or 'disliked'
  const [viewMode, setViewMode] = useState<'search' | 'favorites' | 'liked' | 'disliked'>('search');
  
  // Preference filtering - pending state (before apply)
  const [allPreferences, setAllPreferences] = useState<GetPreferencesResponse>({ preferences: [] });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [importanceOperator, setImportanceOperator] = useState<'equal' | 'less_or_equal' | 'greater_or_equal'>('greater_or_equal');
  const [importanceValue, setImportanceValue] = useState<number>(1);
  
  // Applied filters (actually used in search)
  const [appliedFilters, setAppliedFilters] = useState<{
    preferenceIds: string[];
    importanceOperator: 'equal' | 'less_or_equal' | 'greater_or_equal';
    importanceValue: number;
  }>({
    preferenceIds: [],
    importanceOperator: 'greater_or_equal',
    importanceValue: 1,
  });
  
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
      } else if (viewMode === 'liked' || viewMode === 'disliked') {
        // Fetch votes
        const response: GetMyVotesResponse = await getMyVotes({
          voterId: currentUserId,
          voteType: viewMode === 'liked' ? 'LIKE' : 'DISLIKE',
          page,
          limit: PAGE_SIZE,
        });
        
        setProfiles(response.votes);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } else {
        // Fetch search results - use APPLIED filters
        const response: SearchUsersResponse = await searchUsers({
          userId: currentUserId,
          page,
          limit: PAGE_SIZE,
          preferenceIds: appliedFilters.preferenceIds.length > 0 ? appliedFilters.preferenceIds : undefined,
          importanceOperator: appliedFilters.preferenceIds.length > 0 ? appliedFilters.importanceOperator : undefined,
          importanceValue: appliedFilters.preferenceIds.length > 0 ? appliedFilters.importanceValue : undefined,
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
  }, [currentUserId, page, appliedFilters, viewMode]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleApplyFilters = useCallback((filters: {
    preferenceIds: string[];
    importanceOperator: 'equal' | 'less_or_equal' | 'greater_or_equal';
    importanceValue: number;
  }) => {
    setAppliedFilters(filters);
    setSelectedPreferences(filters.preferenceIds);
    setImportanceOperator(filters.importanceOperator);
    setImportanceValue(filters.importanceValue);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      preferenceIds: [],
      importanceOperator: 'greater_or_equal' as const,
      importanceValue: 1,
    };
    setSelectedPreferences([]);
    setImportanceOperator('greater_or_equal');
    setImportanceValue(1);
    setAppliedFilters(emptyFilters);
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

  const handleToggleVote = useCallback(async (
    profileId: string, 
    currentVote: 'LIKE' | 'DISLIKE' | null, 
    newVote: 'LIKE' | 'DISLIKE'
  ) => {
    try {
      const finalVote = currentVote === newVote ? null : newVote;
      
      // Optimistically update the profile in the current list
      setProfiles(prevProfiles =>
        prevProfiles.map(p => {
          if (p.id !== profileId) return p;
          
          let likesReceived = p.likesReceived || 0;
          let dislikesReceived = p.dislikesReceived || 0;
          
          // Remove old vote count
          if (currentVote === 'LIKE') {
            likesReceived = Math.max(0, likesReceived - 1);
          } else if (currentVote === 'DISLIKE') {
            dislikesReceived = Math.max(0, dislikesReceived - 1);
          }
          
          // Add new vote count
          if (finalVote === 'LIKE') {
            likesReceived += 1;
          } else if (finalVote === 'DISLIKE') {
            dislikesReceived += 1;
          }
          
          return {
            ...p,
            myVoteType: finalVote,
            likesReceived,
            dislikesReceived,
          };
        })
      );
      
      // Make API call
      await toggleVote(currentUserId, profileId, currentVote, newVote);
      
      // If in vote view and removing/changing vote type, handle accordingly
      if ((viewMode === 'liked' || viewMode === 'disliked') && (currentVote === newVote || currentVote !== null)) {
        setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));
        setTotal(prev => prev - 1);
      }
    } catch (err: any) {
      console.error('Error toggling vote:', err);
      setError('Failed to update vote');
      
      // On error, refetch to get correct state
      fetchProfiles();
    }
  }, [currentUserId, viewMode, fetchProfiles]);

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

  const handleSetViewMode = useCallback((mode: 'search' | 'favorites' | 'liked' | 'disliked') => {
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
    handleApplyFilters,
    handleClearFilters,
    handleToggleFavorite,
    handleToggleVote,
    handleTogglePreference,
    handleToggleCategory,
    handleSetImportanceOperator,
    handleSetImportanceValue,
  };
}
