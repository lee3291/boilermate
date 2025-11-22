import { useState, useEffect, useCallback } from 'react';
import { searchUsers, getFavorites, toggleFavorite, getMyVotes, toggleVote } from '@/services/profileService';
import { getPreferences } from '@/services/preferencesService';
import type { ProfileSummary, SearchUsersResponse, GetFavoritesResponse, GetMyVotesResponse } from '@/types/profile';
import type { GetPreferencesResponse } from '@/types/preferences/preference';

const PAGE_SIZE = 9; // 3x3 grid

export default function useRoommatesLogic(userId: string) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Separate totals for each view mode to prevent showing wrong counts when switching
  const [searchTotal, setSearchTotal] = useState(0);
  const [favoritesTotal, setFavoritesTotal] = useState(0);
  const [likedTotal, setLikedTotal] = useState(0);
  const [dislikedTotal, setDislikedTotal] = useState(0);
  const [countsFetched, setCountsFetched] = useState(false);
  
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

  // Comparison state - stores selected user IDs and emails
  const [compareUsers, setCompareUsers] = useState<Array<{ id: string; email: string }>>([]);

  // Load comparison data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('compareUserIds');
    if (stored) {
      try {
        const users = JSON.parse(stored);
        setCompareUsers(users);
      } catch (error) {
        console.error('Failed to parse compare users:', error);
        localStorage.removeItem('compareUserIds');
      }
    }
  }, []);

  // Save comparison data to localStorage whenever it changes
  useEffect(() => {
    if (compareUsers.length > 0) {
      localStorage.setItem('compareUserIds', JSON.stringify(compareUsers));
    } else {
      localStorage.removeItem('compareUserIds');
    }
  }, [compareUsers]);

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

  // Prefetch counts for all view modes on initial load
  useEffect(() => {
    const prefetchCounts = async () => {
      try {
        // Fetch favorites count
        const favoritesResponse = await getFavorites({
          userId,
          page: 1,
          limit: 1, // Only need count, not actual data
        });
        setFavoritesTotal(favoritesResponse.total);

        // Fetch liked count
        const likedResponse = await getMyVotes({
          voterId: userId,
          voteType: 'LIKE',
          page: 1,
          limit: 1,
        });
        setLikedTotal(likedResponse.total);

        // Fetch disliked count
        const dislikedResponse = await getMyVotes({
          voterId: userId,
          voteType: 'DISLIKE',
          page: 1,
          limit: 1,
        });
        setDislikedTotal(dislikedResponse.total);
      } catch (err) {
        console.error('Error prefetching counts:', err);
      } finally {
        setCountsFetched(true);
      }
    };
    
    prefetchCounts();
  }, [userId]);

  // Fetch profiles based on view mode
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (viewMode === 'favorites') {
        // Fetch favorites
        const response: GetFavoritesResponse = await getFavorites({
          userId,
          page,
          limit: PAGE_SIZE,
        });
        
        setProfiles(response.favorites);
        setFavoritesTotal(response.total);
        setTotalPages(response.totalPages);
      } else if (viewMode === 'liked' || viewMode === 'disliked') {
        // Fetch votes
        const response: GetMyVotesResponse = await getMyVotes({
          voterId: userId,
          voteType: viewMode === 'liked' ? 'LIKE' : 'DISLIKE',
          page,
          limit: PAGE_SIZE,
        });
        
        setProfiles(response.votes);
        if (viewMode === 'liked') {
          setLikedTotal(response.total);
        } else {
          setDislikedTotal(response.total);
        }
        setTotalPages(response.totalPages);
      } else {
        // Fetch search results - use APPLIED filters
        const response: SearchUsersResponse = await searchUsers({
          userId,
          page,
          limit: PAGE_SIZE,
          preferenceIds: appliedFilters.preferenceIds.length > 0 ? appliedFilters.preferenceIds : undefined,
          importanceOperator: appliedFilters.preferenceIds.length > 0 ? appliedFilters.importanceOperator : undefined,
          importanceValue: appliedFilters.preferenceIds.length > 0 ? appliedFilters.importanceValue : undefined,
        });
        
        setProfiles(response.profiles);
        setSearchTotal(response.total);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, appliedFilters, viewMode]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Get the correct total based on current view mode
  const getCurrentTotal = useCallback(() => {
    switch (viewMode) {
      case 'favorites': return favoritesTotal;
      case 'liked': return likedTotal;
      case 'disliked': return dislikedTotal;
      default: return searchTotal;
    }
  }, [viewMode, searchTotal, favoritesTotal, likedTotal, dislikedTotal]);

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
      await toggleFavorite(userId, profileId, isFavorited);
      
      // Update the profile in the current list
      setProfiles(prevProfiles =>
        prevProfiles.map(p =>
          p.id === profileId
            ? { ...p, isFavoritedByMe: !isFavorited }
            : p
        )
      );
      
      // If we're in favorites view and user unfavorited, remove from list and refetch for accurate count
      if (viewMode === 'favorites' && isFavorited) {
        setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));
        // Refetch to get accurate total count instead of manually decrementing
        fetchProfiles();
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status');
    }
  }, [userId, viewMode]);

  const handleToggleVote = useCallback(async (
    profileId: string, 
    currentVote: 'LIKE' | 'DISLIKE' | null, 
    newVote: 'LIKE' | 'DISLIKE'
  ) => {
    try {
      // Determine final vote (toggle off if clicking same vote)
      const finalVote = currentVote === newVote ? null : newVote;
      
      // Optimistically update the UI
      setProfiles(prevProfiles =>
        prevProfiles.map(p => {
          if (p.id !== profileId) return p;
          
          // Recalculate vote counts
          let likesReceived = p.likesReceived || 0;
          let dislikesReceived = p.dislikesReceived || 0;
          
          // Remove old vote
          if (currentVote === 'LIKE') {
            likesReceived = Math.max(0, likesReceived - 1);
          } else if (currentVote === 'DISLIKE') {
            dislikesReceived = Math.max(0, dislikesReceived - 1);
          }
          
          // Add new vote
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
      await toggleVote(userId, profileId, currentVote, newVote);
      
      // If viewing liked/disliked and user removed vote, refetch to get accurate data
      if ((viewMode === 'liked' || viewMode === 'disliked') && (currentVote === newVote || currentVote !== null)) {
        // Remove from UI immediately
        setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));
        // Refetch to get accurate total count instead of manually decrementing
        fetchProfiles();
      }
    } catch (err: any) {
      console.error('Error toggling vote:', err);
      setError('Failed to update vote');
      // Revert by refetching
      fetchProfiles();
    }
  }, [userId, viewMode, fetchProfiles]);

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

  // Comparison handlers
  const handleToggleCompare = useCallback((userId: string, userEmail: string) => {
    setCompareUsers(prev => {
      const exists = prev.some(u => u.id === userId);
      if (exists) {
        // Remove from comparison
        return prev.filter(u => u.id !== userId);
      } else {
        // Add to comparison (max 3)
        if (prev.length >= 3) {
          console.warn('Maximum 3 users can be compared');
          return prev;
        }
        return [...prev, { id: userId, email: userEmail }];
      }
    });
  }, []);

  const handleRemoveFromCompare = useCallback((userId: string) => {
    setCompareUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareUsers([]);
    localStorage.removeItem('compareUserIds');
  }, []);

  const isUserInCompare = useCallback((userId: string) => {
    return compareUsers.some(u => u.id === userId);
  }, [compareUsers]);

  return {
    // state
    profiles,
    loading,
    error,
    page,
    totalPages,
    total: getCurrentTotal(),
    searchTotal,
    favoritesTotal,
    likedTotal,
    dislikedTotal,
    countsFetched,
    viewMode,
    allPreferences,
    selectedPreferences,
    importanceOperator,
    importanceValue,
    expandedCategories,
    compareUsers,

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
    handleToggleCompare,
    handleRemoveFromCompare,
    handleClearCompare,
    isUserInCompare,
  };
}
