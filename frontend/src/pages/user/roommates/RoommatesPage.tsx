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

      <div className='flex items-start gap-6 pt-6 px-6'>
        {/* Left sidebar - Filters */}
        <div className='w-96 max-h-screen overflow-y-auto pb-10 bg-white rounded-lg shadow-sm p-6'>
          <h1 className='font-sourceserif4-18pt-regular text-maingray pb-3 text-[60px] font-extralight tracking-[-0.02em] leading-tight'>
            Roommates
          </h1>

          <p className='text-gray-600 text-sm pb-6'>
            Search for roommates by their lifestyle preferences
          </p>

          <h1 className='font-sourceserif4-18pt-regular text-maingray pt-4 pb-4 text-[40px] font-extralight tracking-[-0.02em] border-t border-gray-200'>
            Filter
          </h1>

          {/* Importance filter */}
          <div className='mt-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100'>
            <label className='text-sm font-semibold text-blue-900 mb-3 block'>Importance Level</label>
            <div className='flex items-center gap-2'>
              <select
                value={importanceOperator}
                onChange={(e) => {
                  setImportanceOperator(e.target.value as any);
                  setPage(1);
                }}
                className='h-10 rounded-lg border border-blue-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              >
                <option value="equal">Equal to</option>
                <option value="greater_or_equal">≥ (At least)</option>
                <option value="less_or_equal">≤ (At most)</option>
              </select>
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
                className='h-10 w-16 rounded-lg border border-blue-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-center font-semibold'
              />
            </div>
          </div>

          {/* Preference selection - Collapsible by category */}
          <div className='mt-2'>
            <label className='text-sm font-semibold text-gray-800 mb-3 block bg-green-50 px-3 py-2 rounded-lg border border-green-100'>
              Select Preferences ({selectedPreferences.length} selected)
            </label>
            {Object.entries(preferencesByCategory).map(([category, prefs]) => (
              <div key={category} className='mb-2 border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition'>
                {/* Category header - clickable */}
                <button
                  onClick={() => toggleCategory(category)}
                  className='w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition'
                >
                  <span className='text-sm font-semibold text-gray-800'>{category}</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700'>
                      {prefs.filter(p => selectedPreferences.includes(p.id)).length}/{prefs.length}
                    </span>
                    <span className='text-gray-500 text-lg'>
                      {expandedCategories.has(category) ? '▼' : '▶'}
                    </span>
                  </div>
                </button>
                
                {/* Category preferences - collapsible */}
                {expandedCategories.has(category) && (
                  <div className='p-3 pt-0 pb-4 bg-gray-50 flex flex-wrap gap-2'>
                    {prefs.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => togglePreference(pref.id)}
                        className={`text-xs px-3 py-1.5 rounded-full transition shadow-sm ${
                          selectedPreferences.includes(pref.id)
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type='button'
            onClick={handleClearFilters}
            className='mt-6 h-10 w-full rounded-lg border-2 border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition'
          >
            Clear All Filters
          </button>

          {/* Pagination info */}
          {!loading && (
            <div className='mt-5 text-sm text-gray-600 bg-gray-100 p-3 rounded-lg'>
              Showing {profiles.length > 0 ? ((page - 1) * PAGE_SIZE + 1) : 0}-
              {Math.min(page * PAGE_SIZE, total)} of {total} profiles
            </div>
          )}
        </div>

        {/* Right content area - Profile cards */}
        <div className='flex-1 pb-10 pr-6'>
          <div className='mt-2 flex w-fit flex-wrap justify-start gap-10'>
            {loading && <div className='text-gray-600'>Loading roommates...</div>}
            
            {error && (
              <div className='text-sm whitespace-pre-wrap text-red-600 bg-red-50 p-4 rounded-lg border border-red-200'>
                {error}
              </div>
            )}
            
            {!loading && profiles.length === 0 && (
              <div className='font-roboto-light text-gray-600 bg-yellow-50 p-6 rounded-lg border border-yellow-200'>
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
            <div className='mt-10 flex items-center gap-3'>
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
