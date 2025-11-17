/**
 * ComparePage - Compare multiple user profiles side-by-side
 * EXACT same design as ProfileViewPage but with multiple profiles in columns
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompareProfiles, toggleFavorite, toggleVote } from '@/services/profileService';
import { ProfileDetails } from '@/types/profile';
import Navbar from '../components/Navbar';
import ProfileHeader from '../profile/components/ProfileHeader';
import BioSection from '../profile/components/BioSection';
import { X } from 'lucide-react';

export default function ComparePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerId = user!.id;
  
  const [profiles, setProfiles] = useState<ProfileDetails[]>([]);
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

      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
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

        {/* Grid of profiles */}
        <div className={`grid gap-6 ${profiles.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : profiles.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
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

              {/* Action buttons */}
              <div className='mb-4 flex items-center justify-center gap-2'>
                <button
                  onClick={() => handleToggleVote(profile.id, 'LIKE')}
                  className={`flex items-center gap-1 rounded-full border-2 px-3 py-2 text-sm shadow-lg transition-all hover:scale-105 ${
                    profile.myVoteType === 'LIKE'
                      ? 'border-green-600 bg-green-500 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <span>👍</span>
                  <span className='font-semibold'>{profile.myVoteType === 'LIKE' ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  onClick={() => handleToggleVote(profile.id, 'DISLIKE')}
                  className={`flex items-center gap-1 rounded-full border-2 px-3 py-2 text-sm shadow-lg transition-all hover:scale-105 ${
                    profile.myVoteType === 'DISLIKE'
                      ? 'border-red-600 bg-red-500 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <span>👎</span>
                  <span className='font-semibold'>{profile.myVoteType === 'DISLIKE' ? 'Disliked' : 'Dislike'}</span>
                </button>

                <button
                  onClick={() => handleToggleFavorite(profile.id, profile.isFavoritedByMe || false)}
                  className={`flex items-center gap-1 rounded-full border-2 px-3 py-2 text-sm shadow-lg transition-all hover:scale-105 ${
                    profile.isFavoritedByMe
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span>{profile.isFavoritedByMe ? '❤️' : '🤍'}</span>
                  <span className='font-semibold text-gray-700'>{profile.isFavoritedByMe ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>

              {/* Vote Stats */}
              <div className='mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow'>
                <div className='flex items-center justify-center gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <span>👍</span>
                    <span className='font-semibold text-green-600'>{profile.likesReceived || 0}</span>
                  </div>
                  <div className='h-4 w-px bg-gray-300'></div>
                  <div className='flex items-center gap-1'>
                    <span>👎</span>
                    <span className='font-semibold text-red-600'>{profile.dislikesReceived || 0}</span>
                  </div>
                </div>
              </div>

              {/* Profile Header */}
              <ProfileHeader
                user={{
                  id: profile.id,
                  legalName: profile.legalName || '',
                  email: profile.email || '',
                  name: profile.name || (profile.email ? profile.email.split('@')[0] : ''),
                  profileImage: profile.avatarURL || '',
                  phoneNumber: profile.phoneNumber || '',
                  searchStatus: profile.searchStatus || '',
                  isVerified: profile.isVerified || false,
                }}
                voteStats={{
                  likesReceived: profile.likesReceived || 0,
                  dislikesReceived: profile.dislikesReceived || 0,
                }}
                onAvatarChange={() => {}}
                isEditable={false}
              />

              {/* Bio Section */}
              {profile.bio && (
                <BioSection
                  bio={profile.bio}
                  legalName={profile.legalName || ''}
                  phoneNumber={profile.phoneNumber || ''}
                  searchStatus={profile.searchStatus || ''}
                  onSave={async () => {}}
                />
              )}

              {/* Lifestyle Preferences */}
              <div className='mb-6 rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-lg'>
                <div className='mb-4'>
                  <h2 className='mb-1 text-xl font-bold text-gray-900'>💫 Lifestyle</h2>
                  <p className='text-xs text-gray-600'>Their lifestyle and habits</p>
                </div>

                {profile.lifestylePreferences.length === 0 ? (
                  <p className='py-4 text-center text-sm text-gray-500'>No preferences</p>
                ) : (
                  <div className='space-y-3'>
                    {profile.lifestylePreferences.map((pref) => (
                      <PreferenceCard key={pref.id} preference={pref} />
                    ))}
                  </div>
                )}
              </div>

              {/* Roommate Preferences */}
              <div className='mb-6 rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-lg'>
                <div className='mb-4'>
                  <h2 className='mb-1 text-xl font-bold text-gray-900'>🏠 Roommate</h2>
                  <p className='text-xs text-gray-600'>Looking for in a roommate</p>
                </div>

                {profile.roommatePreferences.length === 0 ? (
                  <p className='py-4 text-center text-sm text-gray-500'>No preferences</p>
                ) : (
                  <div className='space-y-3'>
                    {profile.roommatePreferences.map((pref) => (
                      <PreferenceCard key={pref.id} preference={pref} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

//* Preference Card Component (Same as ProfileViewPage)
interface PreferenceCardProps {
  preference: {
    id: string;
    category: string;
    label: string;
    value: string;
    importance: number;
    visibility: string;
  };
}

function PreferenceCard({ preference }: PreferenceCardProps) {
  const categoryColor = getCategoryColor(preference.category);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < preference.importance;
    return (
      <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    );
  });

  return (
    <div className='group relative rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 transition-all hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColor}`}>
            {preference.category}
          </span>
          <h3 className='mb-0.5 text-sm font-semibold text-gray-900'>{preference.label}</h3>
          <p className='text-xs text-gray-600'>{preference.value}</p>
        </div>

        {preference.visibility === 'PRIVATE' && (
          <span className='ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500'>
            🔒
          </span>
        )}
      </div>

      <div className='mt-2 flex items-center gap-1'>
        {stars}
        <span className='ml-1 text-[10px] text-gray-500'>({preference.importance}/5)</span>
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
