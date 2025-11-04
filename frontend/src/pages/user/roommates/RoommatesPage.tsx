/**
 * Roommates Page
 * Browse and discover potential roommates with preference-based filtering
 * Follows Listings UI pattern
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../services/profileService';
import { getPreferences } from '../../../services/preferencesService';
import type { ProfileSummary, SearchUsersResponse } from '../../../types/profile';
import type { GetPreferencesResponse } from '../../../types/preferences/preference';
import Navbar from '../components/Navbar';

const PAGE_SIZE = 9; // 3x3 grid

export default function RoommatesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Preference filtering
  const [allPreferences, setAllPreferences] = useState<GetPreferencesResponse>({ preferences: [] });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [importanceOperator, setImportanceOperator] = useState<'equal' | 'less_or_equal' | 'greater_or_equal'>('greater_or_equal');
  const [importanceValue, setImportanceValue] = useState<number>(3);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // TODO: Replace with actual userId from auth context
  const userId = '1'; // Hardcoded for now 

  // Fetch master preference list
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await getPreferences();
        setAllPreferences(prefs);
      } catch (err) {
        console.error('Error fetching preferences:', err);
      }
    };
    fetchPreferences();
  }, []);

  // Fetch profiles
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: SearchUsersResponse = await searchUsers({
        userId,
        page,
        limit: PAGE_SIZE,
        preferenceIds: selectedPreferences.length > 0 ? selectedPreferences : undefined,
        importanceOperator: selectedPreferences.length > 0 ? importanceOperator : undefined,
        importanceValue: selectedPreferences.length > 0 ? importanceValue : undefined,
      });
      
      setProfiles(response.profiles);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, selectedPreferences, importanceOperator, importanceValue]);

  const handleViewProfile = (profileId: string) => {
    // Don't allow viewing own profile - redirect to preferences instead
    if (profileId === userId) {
      navigate('/preferences');
      return;
    }
    navigate(`/profile/${profileId}`);
  };

  const handleClearFilters = () => {
    setSelectedPreferences([]);
    setImportanceOperator('greater_or_equal');
    setImportanceValue(3);
    setPage(1);
  };

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
    setPage(1); // Reset to first page when filter changes
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const pillBase = 'h-9 px-4 rounded-[100px] text-sm transition cursor-pointer';
  const pillIdle = 'bg-white border border-gray-300 hover:bg-gray-100';
  const pillActive = 'bg-black text-white';

  // Group preferences by category
  const preferencesByCategory = allPreferences.preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, typeof allPreferences.preferences>);

  return (
    <div className='min-h-screen w-full bg-gray-50'>
      <Navbar />

      {/* Header */}
      <div className='px-8 pt-6 pb-4 bg-white border-b border-gray-200'>
        <h1 className='font-sourceserif4-18pt-regular text-maingray text-[60px] font-extralight tracking-[-0.02em] leading-tight'>
          Roommates
        </h1>
        <p className='text-gray-600 text-sm mt-1'>
          Search for roommates by their lifestyle preferences
        </p>
      </div>

      {/* Horizontal Filter Bar - Clean & Visible Design */}
      <div className='px-8 py-5 bg-white border-b border-gray-200'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0'>
            <h2 className='font-sourceserif4-18pt-regular text-maingray text-[24px] font-extralight tracking-[-0.02em]'>
              Filters
            </h2>
          </div>
          
          <div className='flex-1'>
            {/* Filter Pills Row */}
            <div className='flex items-center gap-2 flex-wrap mb-4'>
              {/* Importance filter pill */}
              <button
                onClick={() => toggleCategory('IMPORTANCE')}
                className={`flex items-center gap-2 h-10 px-4 rounded-lg border-2 transition ${
                  expandedCategories.has('IMPORTANCE')
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className='text-sm font-semibold'>Importance:</span>
                <span className='text-sm font-bold'>
                  {importanceOperator === 'equal' ? '=' : importanceOperator === 'greater_or_equal' ? '≥' : '≤'} {importanceValue}
                </span>
                <span className='text-xs ml-1'>
                  {expandedCategories.has('IMPORTANCE') ? '▲' : '▼'}
                </span>
              </button>

              {/* Preference category pills */}
              {Object.entries(preferencesByCategory).map(([category, prefs]) => {
                const selectedCount = prefs.filter(p => selectedPreferences.includes(p.id)).length;
                const isActive = selectedCount > 0;
                const isExpanded = expandedCategories.has(category);
                
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center gap-2 h-10 px-4 rounded-lg border-2 transition ${
                      isExpanded
                        ? 'bg-black border-black text-white'
                        : isActive
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className='text-sm font-semibold'>{category}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isExpanded || isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedCount}/{prefs.length}
                    </span>
                    <span className='text-xs'>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                );
              })}

              {/* Right controls */}
              <div className='ml-auto flex items-center gap-3'>
                <div className='text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg'>
                  {selectedPreferences.length} selected
                </div>
                
                <button
                  type='button'
                  onClick={handleClearFilters}
                  className='h-10 px-5 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition'
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Expanded Filter Panels - Below the pills */}
            <div className='space-y-3'>
              {/* Importance Filter Panel */}
              {expandedCategories.has('IMPORTANCE') && (
                <div className='p-5 bg-blue-50 rounded-xl border-2 border-blue-200'>
                  <div className='flex items-center gap-4'>
                    <div className='flex-1'>
                      <label className='block text-sm font-semibold text-blue-900 mb-2'>Operator</label>
                      <select
                        value={importanceOperator}
                        onChange={(e) => {
                          setImportanceOperator(e.target.value as any);
                          setPage(1);
                        }}
                        className='w-full h-11 rounded-lg border-2 border-blue-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      >
                        <option value="equal">Equal to (=)</option>
                        <option value="greater_or_equal">At least (≥)</option>
                        <option value="less_or_equal">At most (≤)</option>
                      </select>
                    </div>
                    <div className='w-32'>
                      <label className='block text-sm font-semibold text-blue-900 mb-2'>Value</label>
                      <input
                        type='number'
                        min='1'
                        max='5'
                        step='1'
                        value={importanceValue}
                        onChange={(e) => {
                          setImportanceValue(parseInt(e.target.value));
                          setPage(1);
                        }}
                        className='w-full h-11 rounded-lg border-2 border-blue-300 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter Panels */}
              {Object.entries(preferencesByCategory).map(([category, prefs]) => (
                expandedCategories.has(category) && (
                  <div key={category} className='p-5 bg-gray-50 rounded-xl border-2 border-gray-300'>
                    <div className='text-sm font-bold text-gray-800 mb-3'>{category} Preferences</div>
                    <div className='flex flex-wrap gap-2'>
                      {prefs.map((pref) => (
                        <button
                          key={pref.id}
                          onClick={() => togglePreference(pref.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedPreferences.includes(pref.id)
                              ? 'bg-black text-white border-2 border-black'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {pref.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className='flex gap-6 px-8 pt-6'>
        {/* Left Sidebar - Saved Filters (Mock UI) */}
        <div className='w-64 flex-shrink-0'>
          <div className='bg-white rounded-lg shadow-sm p-5 sticky top-6'>
            <h3 className='font-sourceserif4-18pt-regular text-maingray text-[24px] font-extralight tracking-[-0.02em] mb-4'>
              Saved Searches
            </h3>
            
            {/* Mock saved filters */}
            <div className='space-y-3'>
              <div className='p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm font-semibold text-purple-900'>Early Birds</span>
                  <span className='text-xs text-purple-600'>⭐</span>
                </div>
                <p className='text-xs text-purple-700'>Sleep schedule: Early</p>
                <p className='text-xs text-gray-500 mt-1'>3 preferences</p>
              </div>

              <div className='p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm font-semibold text-green-900'>Clean & Quiet</span>
                  <span className='text-xs text-green-600'>⭐</span>
                </div>
                <p className='text-xs text-green-700'>Cleanliness + Low noise</p>
                <p className='text-xs text-gray-500 mt-1'>5 preferences</p>
              </div>

              <div className='p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm font-semibold text-orange-900'>Social Butterfly</span>
                  <span className='text-xs text-orange-600'>⭐</span>
                </div>
                <p className='text-xs text-orange-700'>Guest friendly + Social</p>
                <p className='text-xs text-gray-500 mt-1'>4 preferences</p>
              </div>
            </div>

            <button className='mt-4 w-full h-9 rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition'>
              + Save Current Search
            </button>

            {/* Stats */}
            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='text-xs text-gray-500 mb-2'>Search Results</div>
              {!loading && (
                <div className='text-sm font-semibold text-gray-800'>
                  {profiles.length > 0 ? ((page - 1) * PAGE_SIZE + 1) : 0}-
                  {Math.min(page * PAGE_SIZE, total)} of {total}
                </div>
              )}
            </div>
          </div>
        </div>

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
            
            {!loading && profiles.length === 0 && (
              <div className='w-full text-center py-10 font-roboto-light text-gray-600 bg-yellow-50 p-6 rounded-lg border border-yellow-200'>
                No roommates found. {selectedPreferences.length > 0 && 'Try adjusting your filters.'}
              </div>
            )}

            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onViewProfile={handleViewProfile}
                isOwnProfile={profile.id === userId}
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
    </div>
  );
}

//* Profile Card Component
interface ProfileCardProps {
  profile: ProfileSummary;
  onViewProfile: (profileId: string) => void;
  isOwnProfile: boolean;
}

function ProfileCard({ profile, onViewProfile, isOwnProfile }: ProfileCardProps) {
  // Helper to get display name (TODO: Use real name fields when available)
  const displayName = profile.email.split('@')[0]; // Use email username part for now

  return (
    <div>
      <div className="absolute h-100 w-140 z-0 bg-black/20 blur-[5px] rounded-lg" />
      <div className="relative h-100 w-140 z-10 border-black border-[1.5px] bg-white rounded-lg">
        <div className="py-5 px-5">
          <h1 className="font-roboto-regular text-3xl tracking-[-0.4pt]">
            {displayName}
          </h1>
          
          <p className="text-xs text-gray-400 mt-1">{profile.email}</p>

          {/* User info */}
          <div className="pt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            {profile.age && <span>Age: {profile.age}</span>}
            {profile.major && <span>• {profile.major}</span>}
            {profile.year && <span>• {profile.year}</span>}
          </div>

          <div className="pt-3 flex gap-4 text-sm text-gray-600">
            <div>
              <span className="font-roboto-bold">{profile.lifestylePreferencesCount}</span>
              {' '}lifestyle
            </div>
            <div>
              <span className="font-roboto-bold">{profile.roommatePreferencesCount}</span>
              {' '}roommate
            </div>
          </div>

          {profile.bio && (
            <p className="pt-3 font-roboto-light text-sm text-wrap line-clamp-3">
              {profile.bio}
            </p>
          )}

          <div className="flex justify-start gap-3">
            <button 
              onClick={() => onViewProfile(profile.id)}
              className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer hover:bg-gray-800 transition"
            >
              {isOwnProfile ? 'Edit Profile' : 'View Profile'}
            </button>
            
            {/* TODO: Add contact/message button when chat is integrated */}
            {/* <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer hover:bg-gray-100 transition">
              Message
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
