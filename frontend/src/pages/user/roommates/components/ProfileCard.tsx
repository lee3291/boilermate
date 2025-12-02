import type { ProfileSummary } from '@/types/profile';
import { Check } from 'lucide-react';

interface ProfileCardProps {
  profile: ProfileSummary;
  onViewProfile: (profileId: string) => void;
  onToggleFavorite: (profileId: string, isFavorited: boolean) => Promise<void>;
  onToggleVote: (profileId: string, currentVote: 'LIKE' | 'DISLIKE' | null, newVote: 'LIKE' | 'DISLIKE') => Promise<void>;
  isOwnProfile: boolean;
  onToggleCompare?: (userId: string, userEmail: string) => void;
  isInCompare?: boolean;
  canAddMore?: boolean;
}

export default function ProfileCard({ 
  profile, 
  onViewProfile, 
  onToggleFavorite, 
  onToggleVote, 
  isOwnProfile,
  onToggleCompare,
  isInCompare = false,
  canAddMore = true,
}: ProfileCardProps) {
  // Helper to get display name (TODO: Use real name fields when available)
  const displayName = profile.email.split('@')[0]; // Use email username part for now
  const isFavorited = profile.isFavoritedByMe || false;
  const currentVote = profile.myVoteType || null;

  return (
    <div className='relative w-full'>
      <div className="absolute h-90 w-full z-0 bg-black/20 blur-[5px] rounded-lg" />
      <div className="relative h-90 w-full z-10 border-black border-[1.5px] bg-white rounded-lg">
        {/* Compare checkbox - top right */}
        {!isOwnProfile && onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(profile.id, profile.email);
            }}
            disabled={!isInCompare && !canAddMore}
            className={`absolute top-4 right-4 z-20 w-10 h-10 rounded border-2 transition-all flex items-center justify-center ${
              isInCompare
                ? 'bg-blue-600 border-blue-600 text-white'
                : canAddMore
                ? 'bg-white border-gray-300 hover:border-blue-600'
                : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={
              isInCompare
                ? 'Remove from comparison'
                : canAddMore
                ? 'Add to comparison'
                : 'Maximum 3 users for comparison'
            }
          >
            {isInCompare && <Check size={20} strokeWidth={3} />}
          </button>
        )}
        
        {/* Heart button - below compare checkbox */}
        {!isOwnProfile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(profile.id, isFavorited);
            }}
            className='absolute top-16 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110'
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className='text-2xl'>
              {isFavorited ? '❤️' : '🤍'}
            </span>
          </button>
        )}
        
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

          {/* Vote Stats */}
          {(profile.likesReceived !== undefined || profile.dislikesReceived !== undefined) && (
            <div className="pt-3 flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-lg">👍</span>
                <span className="font-roboto-bold text-green-600">{profile.likesReceived || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">👎</span>
                <span className="font-roboto-bold text-red-600">{profile.dislikesReceived || 0}</span>
              </div>
            </div>
          )}

          {profile.bio && (
            <p className="pt-3 font-roboto-light text-sm text-wrap line-clamp-3">
              {profile.bio}
            </p>
          )}

          <div className="flex justify-start gap-3">
            {/* Like/Dislike buttons */}
            {!isOwnProfile && (
              <div className="mt-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVote(profile.id, currentVote, 'LIKE');
                  }}
                  className={`px-4 py-2 rounded-full transition-all hover:scale-105 ${
                    currentVote === 'LIKE'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                  }`}
                  title="Like"
                >
                  👍
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVote(profile.id, currentVote, 'DISLIKE');
                  }}
                  className={`px-4 py-2 rounded-full transition-all hover:scale-105 ${
                    currentVote === 'DISLIKE'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                  }`}
                  title="Dislike"
                >
                  👎
                </button>
              </div>
            )}
            
            <button 
              onClick={() => onViewProfile(profile.id)}
              className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer hover:bg-gray-800 transition"
            >
              {isOwnProfile ? 'Edit Profile' : 'View Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
