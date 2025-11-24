/**
 * ProfileViewPage - Read-only profile view for viewing other users
 * Same beautiful design as PreferencesPage but without edit/add/remove buttons
 * Shows another user's profile with lifestyle and roommate preferences
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProfileDetails,
  toggleFavorite,
  toggleVote,
  getIsFollowing,
  followUser,
  unfollowUser,
} from '../../../services/profileService';
import { getRoommates } from '../../../services/roommatesService';
import type { ProfileDetails } from '../../../types/profile';
import type { Roommate } from '../../../types/roommates';
import Navbar from '../components/Navbar';
import ProfileHeader from '../profile/components/ProfileHeader';
import BioSection from '../profile/components/BioSection';
import CompareCart from './components/CompareCart';
import ReviewsSection from './components/ReviewsSection';
import useRoommatesLogic from './useRoommatesLogic';
import FollowButton from '../profile/components/FollowButton';

export default function ProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ProtectedRoute ensures user exists
  const viewerId = user!.id;

  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [myVote, setMyVote] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  // Compare cart logic
  const {
    compareUsers,
    handleToggleCompare,
    handleRemoveFromCompare,
    handleClearCompare,
  } = useRoommatesLogic(viewerId);

  // Check if current profile is in compare cart
  const isInCompare = profile ? compareUsers.some((u: { id: string; email: string }) => u.id === profile.id) : false;

  // Redirect if trying to view own profile
  useEffect(() => {
    if (userId === viewerId) {
      navigate('/preferences');
    }
  }, [userId, viewerId, navigate]);

  useEffect(() => {
    if (!userId || userId === viewerId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch profile data
        const data = await getProfileDetails({ userId, viewerId });
        setProfile(data);

        // Set favorite status from backend response
        setIsFavorited(data.isFavoritedByMe || false);

        // Set vote status from backend response
        setMyVote(data.myVoteType || null);
        
        // Set follow status from backend
        try {
          const followRes = await getIsFollowing(String(userId));
          setIsFollowing(followRes.isFollowing || false);
        } catch (err) {
          console.warn('Failed to fetch follow status', err);
        }

        // Fetch roommate relationships for reviews
        try {
          const roommatesRes = await getRoommates({
            userId: viewerId,
            activeOnly: false,
          });
          setRoommates(roommatesRes.roommates);
        } catch (err) {
          console.warn('Failed to fetch roommates', err);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, viewerId]);

  const handleToggleFavorite = async () => {
    if (!userId) return;

    try {
      await toggleFavorite(viewerId, userId, isFavorited);
      setIsFavorited(!isFavorited);
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update favorite status';
      alert(errorMessage);
    }
  };

  const handleToggleVote = async (voteType: 'LIKE' | 'DISLIKE') => {
    if (!userId || !profile) return;

    try {
      const oldVote = myVote;
      const newVote = myVote === voteType ? null : voteType;

      // Optimistically update local state
      setMyVote(newVote);

      // Update vote counts optimistically
      setProfile((prev: ProfileDetails | null) => {
        if (!prev) return prev;

        let likesReceived = prev.likesReceived || 0;
        let dislikesReceived = prev.dislikesReceived || 0;

        // Remove old vote count
        if (oldVote === 'LIKE') {
          likesReceived = Math.max(0, likesReceived - 1);
        } else if (oldVote === 'DISLIKE') {
          dislikesReceived = Math.max(0, dislikesReceived - 1);
        }

        // Add new vote count
        if (newVote === 'LIKE') {
          likesReceived += 1;
        } else if (newVote === 'DISLIKE') {
          dislikesReceived += 1;
        }

        return {
          ...prev,
          likesReceived,
          dislikesReceived,
        };
      });

      // Make API call
      await toggleVote(viewerId, userId, oldVote, voteType);
    } catch (err: any) {
      console.error('Error toggling vote:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to update vote';
      alert(errorMessage);

      // Revert on error - refetch profile
      try {
        const data = await getProfileDetails({ userId, viewerId });
        setProfile(data);
        setMyVote(data.myVoteType || null);
      } catch (refetchErr) {
        console.error('Error refetching profile:', refetchErr);
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
        <Navbar />
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <div className='text-center text-gray-600'>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
        <Navbar />
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <div className='rounded-xl border border-red-200 bg-red-50 p-6 text-center'>
            <p className='text-red-600'>⚠️ {error || 'Profile not found'}</p>
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

  // Mock user data for ProfileHeader (replace with real data when user model has these fields)
  // Use real profile data from backend

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
      <Navbar />

      <div className='mx-auto max-w-4xl px-4 py-8'>
        {/* Back button and Action buttons */}
        <div className='mb-4 flex items-center justify-between'>
          <button
            onClick={() => navigate('/roommates')}
            className='flex items-center gap-2 px-4 py-2 text-sm text-gray-600 transition hover:text-gray-900'
          >
            ← Back to Roommates
          </button>

          <div className='flex items-center gap-3'>
            {/* Add to Compare Button */}
            <button
              onClick={() => profile && handleToggleCompare(profile.id, profile.email)}
              disabled={!isInCompare && compareUsers.length >= 3}
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                isInCompare
                  ? 'border-blue-600 bg-blue-500 text-white'
                  : compareUsers.length >= 3
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
              title={isInCompare ? 'Remove from comparison' : compareUsers.length >= 3 ? 'Compare limit reached (3 max)' : 'Add to comparison'}
            >
              <span className='text-xl'>{isInCompare ? '✓' : '+'}</span>
              <span className='text-sm font-semibold'>
                {isInCompare ? 'Added to Compare' : 'Add to Compare'}
              </span>
            </button>

            {/* Vote Buttons */}
            <button
              onClick={() => handleToggleVote('LIKE')}
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                myVote === 'LIKE'
                  ? 'border-green-600 bg-green-500 text-white'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
              title='Like'
            >
              <span className='text-xl'>👍</span>
              <span className='text-sm font-semibold'>
                {myVote === 'LIKE' ? 'Liked' : 'Like'}
              </span>
            </button>

            <button
              onClick={() => handleToggleVote('DISLIKE')}
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                myVote === 'DISLIKE'
                  ? 'border-red-600 bg-red-500 text-white'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
              title='Dislike'
            >
              <span className='text-xl'>👎</span>
              <span className='text-sm font-semibold'>
                {myVote === 'DISLIKE' ? 'Disliked' : 'Dislike'}
              </span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                isFavorited
                  ? 'border-pink-300 bg-pink-50'
                  : 'border-gray-200 bg-white'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className='text-xl'>{isFavorited ? '❤️' : '🤍'}</span>
              <span className='text-sm font-semibold text-gray-700'>
                {isFavorited ? 'Favorited' : 'Favorite'}
              </span>
            </button>

            {/* Follow/Unfollow Button */}
            <FollowButton
              isFollowing={isFollowing}
              loading={followLoading}
              onToggle={async () => {
                if (!userId) return;
                setFollowLoading(true);
                try {
                  if (isFollowing) {
                    await unfollowUser(String(userId));
                    setIsFollowing(false);
                  } else {
                    await followUser(String(userId));
                    setIsFollowing(true);
                  }
                } catch (err) {
                  console.error('Follow toggle failed', err);
                } finally {
                  setFollowLoading(false);
                }
              }}
            />
          </div>
        </div>

        {/* Vote Stats Display */}
        {profile &&
          (profile.likesReceived !== undefined ||
            profile.dislikesReceived !== undefined) && (
            <div className='mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow'>
              <div className='flex items-center justify-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>👍</span>
                  <span className='font-semibold text-green-600'>
                    {profile.likesReceived || 0} Likes
                  </span>
                </div>
                <div className='h-4 w-px bg-gray-300'></div>
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>👎</span>
                  <span className='font-semibold text-red-600'>
                    {profile.dislikesReceived || 0} Dislikes
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Profile Header - View-only mode (no avatar editing) */}
        <ProfileHeader
          user={{
            id: profile.id,
            legalName: profile.legalName || '',
            email: profile.email || '',
            name:
              profile.name ||
              (profile.email ? profile.email.split('@')[0] : ''),
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
            isEditable={false}
          />
        )}

        {/* Lifestyle Preferences (I am...) - READ ONLY */}
        <div className='mb-8 rounded-2xl border-2 border-pink-200 bg-white p-8 shadow-lg'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='mb-2 text-3xl font-bold text-gray-900'>
                💫 Lifestyle Preferences
              </h2>
              <p className='text-gray-600'>Their lifestyle and habits</p>
            </div>
          </div>

          {profile.lifestylePreferences.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>
              No lifestyle preferences added yet
            </p>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {profile.lifestylePreferences.map((pref: any) => (
                <PreferenceCard key={pref.id} preference={pref} />
              ))}
            </div>
          )}
        </div>

        {/* Roommate Preferences (I want...) - READ ONLY */}
        <div className='mb-8 rounded-2xl border-2 border-purple-200 bg-white p-8 shadow-lg'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='mb-2 text-3xl font-bold text-gray-900'>
                🏠 Roommate Preferences
              </h2>
              <p className='text-gray-600'>Looking for in a roommate</p>
            </div>
          </div>

          {profile.roommatePreferences.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>
              No roommate preferences added yet
            </p>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {profile.roommatePreferences.map((pref: any) => (
                <PreferenceCard key={pref.id} preference={pref} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {userId && (
          <ReviewsSection
            reviewedUserId={userId}
            currentUserId={viewerId}
            roommates={roommates}
          />
        )}
      </div>

      {/* Compare Cart */}
      <CompareCart
        users={compareUsers}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />
    </div>
  );
}

//* Preference Card Component (Read-only version)
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

  // Render importance stars
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < preference.importance;
    return (
      <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    );
  });

  return (
    <div className='group relative rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-4 transition-all hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <span
            className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}
          >
            {preference.category}
          </span>
          <h3 className='mb-1 font-semibold text-gray-900'>
            {preference.label}
          </h3>
          <p className='text-sm text-gray-600'>{preference.value}</p>
        </div>

        {/* Visibility badge */}
        {preference.visibility === 'PRIVATE' && (
          <span className='ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500'>
            🔒 Private
          </span>
        )}
      </div>

      {/* Importance stars */}
      <div className='mt-3 flex items-center gap-1'>
        {stars}
        <span className='ml-2 text-xs text-gray-500'>
          ({preference.importance}/5)
        </span>
      </div>
    </div>
  );
}

//* Helper function for category colors
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
