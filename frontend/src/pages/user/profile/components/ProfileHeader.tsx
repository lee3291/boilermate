/**
 * ProfileHeader Component
 * Section 1: Displays user's profile picture, name, and personal information
 * Includes avatar upload capability and vote stats (likes/dislikes received)
 * Tinder-inspired card design with gradient background
 */

import AvatarUploader from './AvatarUploader';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    age: number;
    major: string;
    year: string;
    profileImage: string;
  };
  voteStats: {
    likesReceived: number;
    dislikesReceived: number;
  };
  onAvatarChange: (file: File) => void;
  isEditable?: boolean; // Optional: Controls if avatar can be edited (default: true)
}

export default function ProfileHeader({ user, voteStats, onAvatarChange, isEditable = true }: ProfileHeaderProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl">
      <div className="p-8">
        <div className="flex items-start gap-6">
          {/* Profile Image with Upload Capability */}
          <div className="flex-shrink-0">
            <AvatarUploader
              currentAvatarUrl={user.profileImage}
              onAvatarChange={onAvatarChange}
              isEditable={isEditable}
            />
            {/* Online Status Indicator */}
            {/* Commented out - position conflict with avatar uploader */}
            {/* <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-4 border-white bg-green-500" /> */}
          </div>

          {/* Name and Info */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold mb-2">
              {user.name}, {user.age}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="text-lg font-medium">{user.major}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-lg">{user.year} Year</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span className="text-lg">Purdue University</span>
              </div>
            </div>
          </div>

          {/* Vote Stats Card - Shows likes/dislikes received */}
          <div className="hidden md:block flex-shrink-0">
            <div className="rounded-xl bg-white/20 backdrop-blur-sm p-4 border border-white/30 min-w-[140px]">
              <div className="text-center mb-3">
                <div className="text-sm text-white/90 font-semibold mb-2">Your Rating</div>
              </div>
              
              {/* Like/Dislike Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">👍 Likes</span>
                  <span className="text-white font-bold text-lg">{voteStats.likesReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">👎 Dislikes</span>
                  <span className="text-white font-bold text-lg">{voteStats.dislikesReceived}</span>
                </div>
              </div>

              {/* Approval Rate */}
              {(voteStats.likesReceived + voteStats.dislikesReceived) > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(
                        (voteStats.likesReceived / (voteStats.likesReceived + voteStats.dislikesReceived)) * 100
                      )}%
                    </div>
                    <div className="text-xs text-white/80">Approval</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
