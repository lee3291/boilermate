/**
 * ComparePage - Compare multiple user profiles side-by-side
 * Organized by preference categories for easy comparison
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompareProfiles, toggleFavorite, toggleVote } from '@/services/profileService';
import type { CompareProfile } from '@/types/profile';
import Navbar from '../components/Navbar';
import { X } from 'lucide-react';

export default function ComparePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerId = user!.id;
  
  const [profiles, setProfiles] = useState<CompareProfile[]>([]);
  const [lifestyleCategories, setLifestyleCategories] = useState<string[]>([]);
  const [roommateCategories, setRoommateCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompareProfiles = async () => {
      try {
        const stored = localStorage.getItem('compareUserIds');
        if (!stored) {
          navigate('/roommates');
          return;
        }

        const compareUsers: Array<{ id: string; email: string }> = JSON.parse(stored);
        if (compareUsers.length === 0) {
          navigate('/roommates');
          return;
        }

        const userIds = compareUsers.map(u => u.id);
        const response = await getCompareProfiles({
          userIds,
          viewerId: user?.id,
        });

        setProfiles(response.profiles);
        setLifestyleCategories(response.lifestyleCategories);
        setRoommateCategories(response.roommateCategories);
      } catch (err: any) {
        console.error('Error fetching compare profiles:', err);
        setError(err?.message || 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchCompareProfiles();
  }, [user, navigate]);

  const handleRemoveProfile = (userId: string) => {
    const stored = localStorage.getItem('compareUserIds');
    if (stored) {
      const compareUsers: Array<{ id: string; email: string }> = JSON.parse(stored);
      const updated = compareUsers.filter(u => u.id !== userId);
      
      if (updated.length === 0) {
        localStorage.removeItem('compareUserIds');
        navigate('/roommates');
      } else {
        localStorage.setItem('compareUserIds', JSON.stringify(updated));
        setProfiles(prev => prev.filter(p => p.id !== userId));
      }
    }
  };

  const handleToggleFavorite = async (userId: string, isFavorited: boolean) => {
    try {
      await toggleFavorite(viewerId, userId, isFavorited);
      setProfiles(prev => prev.map(p => 
        p.id === userId ? { ...p, isFavoritedByMe: !isFavorited } : p
      ));
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to update favorite status');
    }
  };

  const handleToggleVote = async (userId: string, voteType: 'LIKE' | 'DISLIKE') => {
    try {
      const profile = profiles.find(p => p.id === userId);
      if (!profile) return;

      const oldVote = profile.myVoteType || null;
      const newVote = oldVote === voteType ? null : voteType;

      // Optimistically update
      setProfiles(prev => prev.map(p => {
        if (p.id !== userId) return p;

        let likesReceived = p.likesReceived || 0;
        let dislikesReceived = p.dislikesReceived || 0;

        if (oldVote === 'LIKE') likesReceived = Math.max(0, likesReceived - 1);
        else if (oldVote === 'DISLIKE') dislikesReceived = Math.max(0, dislikesReceived - 1);

        if (newVote === 'LIKE') likesReceived += 1;
        else if (newVote === 'DISLIKE') dislikesReceived += 1;

        return { ...p, myVoteType: newVote, likesReceived, dislikesReceived };
      }));

      await toggleVote(viewerId, userId, oldVote, voteType);
    } catch (err: any) {
      console.error('Error toggling vote:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to update vote');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
        <Navbar />
        <div className='mx-auto max-w-7xl px-4 py-8'>
          <div className='text-center text-gray-600'>Loading profiles...</div>
        </div>
      </div>
    );
  }

  if (error || profiles.length === 0) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
        <Navbar />
        <div className='mx-auto max-w-7xl px-4 py-8'>
          <div className='rounded-xl border border-red-200 bg-red-50 p-6 text-center'>
            <p className='text-red-600'>⚠️ {error || 'No profiles to compare'}</p>
            <button
              onClick={() => navigate('/roommates')}
              className='mt-4 rounded-full bg-black px-6 py-2 text-white transition hover:bg-gray-800'
            >
              Back to Roommates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
      <Navbar />

      <div className='mx-auto px-6 py-6' style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <button
            onClick={() => navigate('/roommates')}
            className='flex items-center gap-2 px-4 py-2 text-sm text-gray-600 transition hover:text-gray-900'
          >
            ← Back to Roommates
          </button>
          <h1 className='text-2xl font-bold text-gray-800'>
            Compare Profiles ({profiles.length})
          </h1>
          <div className='w-40' />
        </div>

        {/* Profile Headers Section */}
        <div className='mb-8 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg'>
          <div className='mb-4 flex items-center gap-2'>
            <span className='text-2xl'>👥</span>
            <h2 className='text-lg font-bold text-gray-900'>Profiles</h2>
          </div>
          <div className='grid gap-6' style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
            {profiles.map((profile) => (
              <div key={profile.id} className='relative'>
              {/* Remove button */}
              <button
                onClick={() => handleRemoveProfile(profile.id)}
                className='absolute -top-2 -right-2 z-10 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600'
                title='Remove from comparison'
              >
                <X size={16} />
              </button>

              {/* Compact Action buttons row - on top */}
              <div className='mb-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm'>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={() => handleToggleVote(profile.id, 'LIKE')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:scale-105 ${
                      profile.myVoteType === 'LIKE'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className='text-lg'>👍</span>
                    <span className='min-w-8 text-sm font-bold text-center'>{profile.likesReceived || 0}</span>
                  </button>

                  <button
                    onClick={() => handleToggleVote(profile.id, 'DISLIKE')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:scale-105 ${
                      profile.myVoteType === 'DISLIKE'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className='text-lg'>👎</span>
                    <span className='min-w-8 text-sm font-bold text-center'>{profile.dislikesReceived || 0}</span>
                  </button>

                  <button
                    onClick={() => handleToggleFavorite(profile.id, profile.isFavoritedByMe || false)}
                    className={`flex items-center justify-center rounded-lg px-4 py-2 transition-all hover:scale-105 ${
                      profile.isFavoritedByMe
                        ? 'bg-pink-100 text-pink-600 shadow-md'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <span className='text-xl'>{profile.isFavoritedByMe ? '❤️' : '🤍'}</span>
                  </button>
                </div>
              </div>

              {/* Profile Header - compact version */}
              <div className='rounded-2xl border-2 border-purple-200 bg-linear-to-br from-pink-400 to-purple-500 p-4 shadow-lg'>
                <div className='flex items-center gap-3'>
                  {/* Avatar */}
                  <div className='h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg'>
                    {profile.avatarURL ? (
                      <img src={profile.avatarURL} alt='Avatar' className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-purple-300 to-pink-300'>
                        <span className='text-2xl font-bold text-white'>
                          {profile.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <h1 className='mb-1 text-base font-bold text-white truncate'>
                      {profile.legalName || profile.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className='mb-1 text-xs text-white/90 truncate'>{profile.email}</p>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      {profile.isVerified && (
                        <span className='inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white'>
                          ✓ Verified
                        </span>
                      )}
                      <span className='inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white'>
                        👁️ {profile.searchStatus || 'Looking'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                {(profile.age || profile.year || profile.major) && (
                  <div className='mt-3 grid grid-cols-3 gap-1.5 text-center'>
                    {profile.age && (
                      <div className='rounded-lg bg-white/20 px-2 py-1'>
                        <p className='text-[10px] text-white/80'>Age</p>
                        <p className='text-xs font-bold text-white'>{profile.age}</p>
                      </div>
                    )}
                    {profile.year && (
                      <div className='rounded-lg bg-white/20 px-2 py-1'>
                        <p className='text-[10px] text-white/80'>Year</p>
                        <p className='text-xs font-bold text-white'>{profile.year}</p>
                      </div>
                    )}
                    {profile.major && (
                      <div className='rounded-lg bg-white/20 px-2 py-1 col-span-3'>
                        <p className='text-[10px] text-white/80'>Major</p>
                        <p className='text-xs font-bold text-white truncate'>{profile.major}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio Section */}
        <div className='mb-8 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg'>
          <div className='mb-4 flex items-center gap-2'>
            <span className='text-2xl'>📝</span>
            <h2 className='text-lg font-bold text-gray-900'>Bio</h2>
          </div>
          <div className='grid gap-6' style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
            {profiles.map((profile) => (
              <div key={profile.id}>
                {profile.bio ? (
                  <div className='rounded-xl border-2 border-gray-100 bg-linear-to-br from-gray-50 to-white p-4'>
                    <p className='text-sm leading-relaxed text-gray-700'>{profile.bio}</p>
                  </div>
                ) : (
                  <div className='rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center'>
                    <p className='text-sm text-gray-400'>No bio added</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Preferences Section */}
        <div className='mb-8'>
          <div className='mb-6 flex items-center gap-3'>
            <span className='text-3xl'>💫</span>
            <h2 className='text-2xl font-bold text-gray-900'>Lifestyle Preferences</h2>
          </div>
          
          <div className='space-y-4'>
            {lifestyleCategories.map((category) => (
              <div key={category} className='rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl'>
                <div className='mb-4'>
                  <h3 className='text-base font-bold text-gray-900 uppercase tracking-wide'>{category}</h3>
                </div>
                <div className='grid gap-6' style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
                  {profiles.map((profile) => {
                    const prefsInCategory = profile.lifestyleByCategory[category] || [];
                    
                    return (
                      <div key={profile.id}>
                        {prefsInCategory.length > 0 ? (
                          <div className='grid grid-cols-2 gap-2'>
                            {prefsInCategory.map((pref) => (
                              <CompactPreferenceCard key={pref.id} preference={pref} category={category} />
                            ))}
                          </div>
                        ) : (
                          <div className='rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center'>
                            <p className='text-sm text-gray-400'>No preference</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roommate Preferences Section */}
        <div className='mb-8'>
          <div className='mb-6 flex items-center gap-3'>
            <span className='text-3xl'>🏠</span>
            <h2 className='text-2xl font-bold text-gray-900'>Roommate Preferences</h2>
          </div>
          
          <div className='space-y-4'>
            {roommateCategories.map((category) => (
              <div key={category} className='rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl'>
                <div className='mb-4'>
                  <h3 className='text-base font-bold text-gray-900 uppercase tracking-wide'>{category}</h3>
                </div>
                <div className='grid gap-6' style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
                  {profiles.map((profile) => {
                    const prefsInCategory = profile.roommatePreferencesByCategory[category] || [];
                    
                    return (
                      <div key={profile.id}>
                        {prefsInCategory.length > 0 ? (
                          <div className='grid grid-cols-2 gap-2'>
                            {prefsInCategory.map((pref) => (
                              <CompactPreferenceCard key={pref.id} preference={pref} category={category} />
                            ))}
                          </div>
                        ) : (
                          <div className='rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center'>
                            <p className='text-sm text-gray-400'>No preference</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

//* Compact Preference Card Component for comparison view (2-column grid)
interface PreferenceCardProps {
  preference: {
    id: string;
    label: string;
    value: string;
    importance: number;
    visibility: string;
  };
  category: string; // Category passed separately since it's not in GroupedPreferenceDetail
}

function CompactPreferenceCard({ preference, category }: PreferenceCardProps) {
  const categoryColor = getCategoryColor(category);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < preference.importance;
    return (
      <span key={i} className={filled ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}>
        ★
      </span>
    );
  });

  return (
    <div className='group relative rounded-lg border-2 border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 transition-all hover:border-purple-300 hover:shadow-md'>
      <div className='mb-1.5 flex items-start justify-between'>
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryColor}`}>
          {category}
        </span>
        {preference.visibility === 'PRIVATE' && (
          <span className='text-xs'>🔒</span>
        )}
      </div>
      
      <h3 className='mb-1 text-xs font-bold text-gray-900'>{preference.label}</h3>
      <p className='mb-2 text-xs text-gray-600 line-clamp-2'>{preference.value}</p>

      <div className='flex items-center gap-0.5'>
        {stars}
      </div>
    </div>
  );
}

//* Helper function for category colors (Same as ProfileViewPage)
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Sleep: 'bg-blue-100 text-blue-700',
    Cleanliness: 'bg-green-100 text-green-700',
    Social: 'bg-purple-100 text-purple-700',
    Noise: 'bg-yellow-100 text-yellow-700',
    Guests: 'bg-pink-100 text-pink-700',
    Lifestyle: 'bg-indigo-100 text-indigo-700',
    Study: 'bg-cyan-100 text-cyan-700',
    Diet: 'bg-orange-100 text-orange-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}
