/**
 * Recommendation Card Component
 * Displays a recommended roommate match with score and reasons
 */

import { useState } from 'react';
import type { Recommendation } from '@/types/recommendation';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (candidateId: string) => Promise<void>;
  onDecline: (candidateId: string) => Promise<void>;
  onViewProfile: (candidateId: string) => void;
  isOwnProfile: boolean;
}

export default function RecommendationCard({
  recommendation,
  onAccept,
  onDecline,
  onViewProfile,
  isOwnProfile,
}: RecommendationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { candidate, score, reasons } = recommendation;

  if (!candidate) return null;

  const handleAccept = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onAccept(candidate.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onDecline(candidate.id);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate match tier for color coding
  const getMatchTier = (score: number) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Excellent Match' };
    if (score >= 65) return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Great Match' };
    if (score >= 50) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Good Match' };
    return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Match' };
  };

  const matchTier = getMatchTier(score);

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition w-[280px] flex flex-col'>
      {/* Match Score Header */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center justify-between mb-2'>
          <div className={`${matchTier.color} px-3 py-1.5 rounded-full text-xs font-semibold border`}>
            {Math.round(score)}% Match
          </div>
          <button
            onClick={() => onViewProfile(candidate.id)}
            className='text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline'
            disabled={isOwnProfile}
          >
            {isOwnProfile ? 'You' : 'View Profile'}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className='p-4 flex-1 flex flex-col'>
        {/* Avatar & Name */}
        <div className='flex flex-col items-center mb-3'>
          <div className='relative w-20 h-20 mb-2'>
            <img
              src={candidate.avatarURL || '/default-avatar.png'}
              alt={candidate.legalName || candidate.email}
              className='w-full h-full rounded-full object-cover border-2 border-gray-200'
            />
          </div>
          <h3 className='font-semibold text-gray-900 text-center text-sm'>
            {candidate.legalName || candidate.email.split('@')[0]}
          </h3>
          <p className='text-xs text-gray-500 truncate max-w-full'>
            {candidate.email}
          </p>
        </div>

        {/* Match Reasons */}
        {reasons && reasons.topMatches && reasons.topMatches.length > 0 && (
          <div className='mb-3 flex-1'>
            <p className='text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1'>
              <span>✨</span> Why you matched:
            </p>
            <div className='space-y-1.5'>
              {reasons.topMatches.slice(0, 4).map((reason, idx) => (
                <div key={idx} className='flex items-start gap-2'>
                  <span className='text-green-600 text-xs mt-0.5 flex-shrink-0'>✓</span>
                  <span className='text-xs text-gray-700 leading-snug'>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio Preview */}
        {candidate.bio && (
          <div className='mb-3'>
            <p className='text-xs text-gray-600 line-clamp-2 italic'>
              "{candidate.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='p-4 pt-2 flex gap-2 border-t border-gray-100'>
        <button
          onClick={handleDecline}
          disabled={isProcessing || isOwnProfile}
          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Pass
        </button>
        <button
          onClick={handleAccept}
          disabled={isProcessing || isOwnProfile}
          className='flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isProcessing ? 'Sending...' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
