/**
 * ProfileViewPage - Read-only profile view for viewing other users
 * Same beautiful design as PreferencesPage but without edit/add/remove buttons
 * Shows another user's profile with lifestyle and roommate preferences
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileDetails, toggleFavorite, toggleVote } from '../../../services/profileService';
import type { ProfileDetails } from '../../../types/profile';
import Navbar from '../components/Navbar';
import ProfileHeader from '../preferences/components/ProfileHeader';
import BioSection from '../preferences/components/BioSection';

export default function ProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [myVote, setMyVote] = useState<'LIKE' | 'DISLIKE' | null>(null);

  // TODO: Replace with actual viewerId from auth context
  const viewerId = '1'; // Hardcoded for now

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

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProfileDetails({ userId, viewerId });
        setProfile(data);
        
        // Set favorite status from backend response
        setIsFavorited(data.isFavoritedByMe || false);
        
        // Set vote status from backend response
        setMyVote(data.myVoteType || null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, viewerId]);

  const handleToggleFavorite = async () => {
    if (!userId) return;
    
    try {
      await toggleFavorite(viewerId, userId, isFavorited);
      setIsFavorited(!isFavorited);
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update favorite status';
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
      setProfile(prev => {
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
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update vote';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600">⚠️ {error || 'Profile not found'}</p>
            <button
              onClick={() => navigate('/roommates')}
              className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
            >
              Back to Roommates
            </button>
          </div>
        </div>
      </div>
    );
  }

    // Mock user data for ProfileHeader (replace with real data when user model has these fields)
  const displayName = profile.email.split('@')[0]; // Use email username for now
  const mockUser = {
    id: profile.id,
    name: displayName, // TODO: Use real username/firstName/lastName when available
    age: profile.age || 0,
    major: profile.major || '',
    year: profile.year || '',
    profileImage: 'https://i.pravatar.cc/300?u=' + profile.id, // Mock avatar based on ID
    bio: profile.bio || '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back button and Action buttons */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/roommates')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
          >
            ← Back to Roommates
          </button>
          
          <div className="flex items-center gap-3">
            {/* Vote Buttons */}
            <button
              onClick={() => handleToggleVote('LIKE')}
              className={`px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-2 hover:scale-105 ${
                myVote === 'LIKE'
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
              title="Like"
            >
              <span className="text-xl">👍</span>
              <span className="text-sm font-semibold">
                {myVote === 'LIKE' ? 'Liked' : 'Like'}
              </span>
            </button>

            <button
              onClick={() => handleToggleVote('DISLIKE')}
              className={`px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-2 hover:scale-105 ${
                myVote === 'DISLIKE'
                  ? 'bg-red-500 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
              title="Dislike"
            >
              <span className="text-xl">👎</span>
              <span className="text-sm font-semibold">
                {myVote === 'DISLIKE' ? 'Disliked' : 'Dislike'}
              </span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-2 hover:scale-105 ${
                isFavorited
                  ? 'bg-pink-50 border-pink-300'
                  : 'bg-white border-gray-200'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="text-xl">
                {isFavorited ? '❤️' : '🤍'}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {isFavorited ? 'Favorited' : 'Favorite'}
              </span>
            </button>
          </div>
        </div>

        {/* Vote Stats Display */}
        {profile && (profile.likesReceived !== undefined || profile.dislikesReceived !== undefined) && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">👍</span>
                <span className="font-semibold text-green-600">
                  {profile.likesReceived || 0} Likes
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👎</span>
                <span className="font-semibold text-red-600">
                  {profile.dislikesReceived || 0} Dislikes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader user={mockUser} />

        {/* Bio Section */}
        {mockUser.bio && <BioSection bio={mockUser.bio} />}

        {/* Lifestyle Preferences (I am...) - READ ONLY */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg border-2 border-pink-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                💫 Lifestyle Preferences
              </h2>
              <p className="text-gray-600">Their lifestyle and habits</p>
            </div>
          </div>

          {profile.lifestylePreferences.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No lifestyle preferences added yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.lifestylePreferences.map((pref) => (
                <PreferenceCard key={pref.id} preference={pref} />
              ))}
            </div>
          )}
        </div>

        {/* Roommate Preferences (I want...) - READ ONLY */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🏠 Roommate Preferences
              </h2>
              <p className="text-gray-600">Looking for in a roommate</p>
            </div>
          </div>

          {profile.roommatePreferences.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No roommate preferences added yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.roommatePreferences.map((pref) => (
                <PreferenceCard key={pref.id} preference={pref} />
              ))}
            </div>
          )}
        </div>
      </div>
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
    <div className="group relative rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${categoryColor}`}>
            {preference.category}
          </span>
          <h3 className="font-semibold text-gray-900 mb-1">{preference.label}</h3>
          <p className="text-sm text-gray-600">{preference.value}</p>
        </div>
        
        {/* Visibility badge */}
        {preference.visibility === 'PRIVATE' && (
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            🔒 Private
          </span>
        )}
      </div>
      
      {/* Importance stars */}
      <div className="mt-3 flex items-center gap-1">
        {stars}
        <span className="ml-2 text-xs text-gray-500">
          ({preference.importance}/5)
        </span>
      </div>
    </div>
  );
}

//* Helper function for category colors
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Sleep': 'bg-blue-100 text-blue-700',
    'Cleanliness': 'bg-green-100 text-green-700',
    'Social': 'bg-purple-100 text-purple-700',
    'Noise': 'bg-yellow-100 text-yellow-700',
    'Guests': 'bg-pink-100 text-pink-700',
    'Lifestyle': 'bg-indigo-100 text-indigo-700',
    'Study': 'bg-cyan-100 text-cyan-700',
    'Diet': 'bg-orange-100 text-orange-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}
