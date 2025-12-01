/**
 * Roommates Page
 * Browse and discover potential roommates with preference-based filtering
 * Follows industry standard pattern with logic abstraction
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRoommatesLogic from './useRoommatesLogic';
import Navbar from '../components/Navbar';
import RoommatesSidebar from './components/RoommatesSidebar';
import FilterBar from './components/FilterBar';
import ProfileCard from './components/ProfileCard';
import RecommendationCard from './components/RecommendationCard';
import CompareCart from './components/CompareCart';

const PAGE_SIZE = 9; // 3x3 grid

export default function RoommatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ProtectedRoute already ensures user exists, so we can safely assert it
  const userId = user!.id;
  
  const {
    profiles,
    loading,
    error,
    page,
    totalPages,
    total,
    searchTotal,
    favoritesTotal,
    likedTotal,
    dislikedTotal,
    recommendedTotal,
    countsFetched,
    viewMode,
    allPreferences,
    selectedPreferences,
    importanceOperator,
    importanceValue,
    expandedCategories,
    compareUsers,
    recommendations,
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
    handleAcceptRecommendation,
    handleDeclineRecommendation,
  } = useRoommatesLogic(userId);

  const handleViewProfile = (profileId: string) => {
    // Don't allow viewing own profile - redirect to preferences instead
    if (profileId === userId) {
      navigate('/preferences');
      return;
    }
    navigate(`/profile/${profileId}`);
  };

  const pillBase = 'h-9 px-4 rounded-[100px] text-sm transition cursor-pointer';

  return (
    <div className='min-h-screen w-full bg-gray-50'>
      <Navbar />

      {/* Header */}
      <div className='px-8 pt-6 pb-4 bg-white border-b border-gray-200'>
        <h1 className='font-sourceserif4-18pt-regular text-maingray text-[60px] font-extralight tracking-[-0.02em] leading-tight'>
          Roommates
        </h1>
        <p className='text-gray-600 text-sm mt-1'>
          {viewMode === 'recommended'
            ? 'Personalized roommate recommendations based on your preferences'
            : 'Search for roommates by their lifestyle preferences'}
        </p>
      </div>

      {/* Filter Bar - Only shown in search mode */}
      {viewMode === 'search' && (
        <FilterBar
          allPreferences={allPreferences}
          selectedPreferences={selectedPreferences}
          importanceOperator={importanceOperator}
          importanceValue={importanceValue}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {/* Main content area */}
      <div className='flex gap-6 px-8 pt-6'>
        {/* Left Sidebar */}
        <RoommatesSidebar
          viewMode={viewMode}
          onSetViewMode={handleSetViewMode}
          searchTotal={searchTotal}
          favoritesTotal={favoritesTotal}
          likedTotal={likedTotal}
          dislikedTotal={dislikedTotal}
          recommendedTotal={recommendedTotal}
          countsFetched={countsFetched}
          page={page}
          pageSize={PAGE_SIZE}
          loading={loading}
        />

        {/* Profile Cards Grid */}
        <div className='flex-1 pb-10'>
          <div className='flex flex-wrap justify-start gap-8'>
            {loading && (
              <div className='w-full text-center py-10 text-gray-600'>
                Loading roommates...
              </div>
            )}
            
            {error && (
              <div className='w-full text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200'>
                {error}
              </div>
            )}
            
            {/* Recommended View */}
            {viewMode === 'recommended' && !loading && recommendations.length === 0 && (
              <div className='w-full text-center py-10 bg-purple-50 p-6 rounded-lg border border-purple-200'>
                <p className='text-gray-700 font-medium mb-2'>No recommendations yet</p>
                <p className='text-sm text-gray-600'>
                  Recommendations are generated daily at 1:00 AM. Check back tomorrow!
                </p>
              </div>
            )}

            {viewMode === 'recommended' && recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAccept={handleAcceptRecommendation}
                onDecline={handleDeclineRecommendation}
                onViewProfile={handleViewProfile}
                isOwnProfile={rec.candidateId === userId}
              />
            ))}
            
            {/* Other Views */}
            {viewMode !== 'recommended' && !loading && profiles.length === 0 && (
              <div className='w-full text-center py-10 font-roboto-light text-gray-600 bg-yellow-50 p-6 rounded-lg border border-yellow-200'>
                No roommates found. {selectedPreferences.length > 0 && 'Try adjusting your filters.'}
              </div>
            )}

            {viewMode !== 'recommended' && profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onViewProfile={handleViewProfile}
                onToggleFavorite={handleToggleFavorite}
                onToggleVote={handleToggleVote}
                isOwnProfile={profile.id === userId}
                onToggleCompare={handleToggleCompare}
                isInCompare={isUserInCompare(profile.id)}
                canAddMore={compareUsers.length < 3}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className='mt-10 flex items-center justify-center gap-3'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`${pillBase} ${page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
              >
                Previous
              </button>
              
              <span className='text-sm font-medium text-gray-700 px-4 py-2 bg-white rounded-lg border border-gray-200'>
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`${pillBase} ${page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compare Cart - Fixed at bottom-right */}
      <CompareCart
        users={compareUsers}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />
    </div>
  );
}
