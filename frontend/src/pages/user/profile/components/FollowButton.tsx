import React from 'react';

interface FollowButtonProps {
  isFollowing: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export default function FollowButton({
  isFollowing,
  loading = false,
  onToggle,
}: FollowButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full border-2 px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
        isFollowing
          ? 'border-blue-600 bg-blue-500 text-white'
          : 'border-gray-200 bg-white text-gray-700'
      } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span className='text-xl'>{isFollowing ? '👥' : '👤'}</span>
      <span className='text-sm font-semibold'>
        {loading
          ? isFollowing
            ? 'Unfollowing...'
            : 'Following...'
          : isFollowing
            ? 'Following'
            : 'Follow'}
      </span>
    </button>
  );
}
