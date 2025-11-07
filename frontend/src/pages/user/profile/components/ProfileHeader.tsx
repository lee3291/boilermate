/**
 * ProfileHeader Component
 * Section 1: Displays user's profile picture, name, and personal information
 * Includes avatar upload capability and vote stats (likes/dislikes received)
 * Tinder-inspired card design with gradient background
 */

import AvatarUploader from './AvatarUploader';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ProfileHeaderProps {
  user: {
    id: string;
    legalName: string;
    email: string;
    name: string;
    profileImage: string;
    phoneNumber?: string;
    searchStatus?: string;
    isVerified?: boolean;
  };
  voteStats: {
    likesReceived: number;
    dislikesReceived: number;
  };
  onAvatarChange: (file: File) => void;
  isEditable?: boolean; // Optional: Controls if avatar can be edited (default: true)
}

export default function ProfileHeader(props: ProfileHeaderProps) {
  const { user, voteStats, onAvatarChange, isEditable = true } = props;

  // Format US phone numbers as +1 (XXX) XXX-XXXX
  function formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone; // fallback to raw
  }
  return (
    <div className='mb-8 min-h-[250px] overflow-hidden rounded-2xl bg-linear-to-br from-pink-500 to-purple-600 shadow-2xl'>
      <div className='p-8'>
        <div className='flex items-start gap-8'>
          {/* Profile Image with Upload Capability */}
          <div className='mr-6 shrink-0'>
            <AvatarUploader
              currentAvatarUrl={user.profileImage}
              onAvatarChange={onAvatarChange}
              isEditable={isEditable}
            />
          </div>

          {/* Name, Verified Badge, and Info */}
          <div className='flex-1 text-white'>
            <div className='mb-2 flex items-center gap-2'>
              <h1 className='text-4xl font-bold'>
                {user.legalName || user.email}
              </h1>
              {user.isVerified && <VerifiedBadge className='ml-2' />}
            </div>
            <div className='mb-2 text-lg font-medium'>{user.email}</div>
            <div className='space-y-2'>
              {user.phoneNumber && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>📞</span>
                  <span className='text-lg'>
                    {formatPhoneNumber(user.phoneNumber)}
                  </span>
                </div>
              )}
              {user.searchStatus && (
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>�</span>
                  <span className='text-lg capitalize'>
                    {user.searchStatus.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vote Stats Card - Shows likes/dislikes received */}
          <div className='hidden shrink-0 md:block'>
            <div className='min-w-[140px] rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-sm'>
              <div className='mb-3 text-center'>
                <div className='mb-2 text-sm font-semibold text-white/90'>
                  Your Rating
                </div>
              </div>
              {/* Like/Dislike Stats */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-white/80'>👍 Likes</span>
                  <span className='text-lg font-bold text-white'>
                    {voteStats.likesReceived}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-white/80'>👎 Dislikes</span>
                  <span className='text-lg font-bold text-white'>
                    {voteStats.dislikesReceived}
                  </span>
                </div>
              </div>
              {/* Approval Rate */}
              {voteStats.likesReceived + voteStats.dislikesReceived > 0 && (
                <div className='mt-3 border-t border-white/20 pt-3'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white'>
                      {Math.round(
                        (voteStats.likesReceived /
                          (voteStats.likesReceived +
                            voteStats.dislikesReceived)) *
                          100,
                      )}
                      %
                    </div>
                    <div className='text-xs text-white/80'>Approval</div>
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
