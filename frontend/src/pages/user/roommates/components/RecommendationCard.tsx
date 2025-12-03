/**
 * Recommendation Card Component
 * Displays a recommended roommate match with score and reasons
 * Matches the ProfileCard layout with additional match information
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
    if (score >= 80) return { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Excellent' };
    if (score >= 65) return { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Great' };
    if (score >= 50) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Good' };
    return { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Match' };
  };

  const matchTier = getMatchTier(score);
  const displayName = candidate.legalName || candidate.email.split('@')[0];

  return (
    <div className='relative w-full min-h-[280px]'>
      <div className="absolute inset-0 z-0 bg-black/20 blur-[5px] rounded-lg" />
      <div className="relative w-full min-h-[280px] z-10 border-black border-[1.5px] bg-white rounded-lg flex flex-col">
        {/* Match Score Badge - top right */}
        <div className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-roboto-bold ${matchTier.bgColor} ${matchTier.color}`}>
          {Math.round(score)}% Match
        </div>
        
        <div className="py-4 px-5 flex-1 flex flex-col">
          <h1 className="font-roboto-regular text-3xl tracking-[-0.4pt]">
            {displayName}
          </h1>
          
          <p className="text-xs text-gray-400 mt-1">{candidate.email}</p>

          {/* Match reasons - replaces user info section */}
          {reasons && reasons.topMatches && reasons.topMatches.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-roboto-bold text-gray-700 mb-1.5">
                ✨ Why you matched:
              </p>
              <div className="space-y-0.5">
                {reasons.topMatches.slice(0, 3).map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-green-600 text-xs mt-0.5">✓</span>
                    <span className="text-xs text-gray-600 font-roboto-light">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preference counts */}
          <div className="pt-2 flex gap-4 text-sm text-gray-600">
            <div>
              <span className="font-roboto-bold">{candidate.lifestylePreferencesCount || 0}</span>
              {' '}lifestyle
            </div>
            <div>
              <span className="font-roboto-bold">{candidate.roommatePreferencesCount || 0}</span>
              {' '}roommate
            </div>
          </div>

          {/* Vote Stats */}
          {(candidate.likesReceived !== undefined || candidate.dislikesReceived !== undefined) && (
            <div className="pt-2 flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-lg">👍</span>
                <span className="font-roboto-bold text-green-600">{candidate.likesReceived || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">👎</span>
                <span className="font-roboto-bold text-red-600">{candidate.dislikesReceived || 0}</span>
              </div>
            </div>
          )}

          {candidate.bio && (
            <p className="pt-2 font-roboto-light text-sm text-wrap line-clamp-3">
              {candidate.bio}
            </p>
          )}

          <div className="flex justify-start gap-3 mt-auto pt-4">
            {/* Pass/Connect buttons - replaces like/dislike */}
            {!isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-full transition-all hover:scale-105 bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Pass on this match"
                >
                  Pass
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-full transition-all hover:scale-105 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Connect with this match"
                >
                  {isProcessing ? '...' : 'Connect'}
                </button>
              </div>
            )}
            
            <button 
              onClick={() => onViewProfile(candidate.id)}
              disabled={isOwnProfile}
              className="h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOwnProfile ? 'You' : 'View Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
