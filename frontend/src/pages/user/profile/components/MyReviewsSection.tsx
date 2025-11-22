/**
 * MyReviewsSection Component
 * Shows all reviews received and given by the current user
 */

import { useState, useEffect } from 'react';
import type { RoommateReview } from '@/types/roommate-review';
import type { Roommate } from '@/types/roommates';
import ReviewCard from '../../roommates/components/ReviewCard';
import {
  getReviews,
  updateReview,
  deleteReview,
} from '@/services/roommateReviewService';
import { getRoommates } from '@/services/roommatesService';

interface MyReviewsSectionProps {
  currentUserId: string;
}

export default function MyReviewsSection({ currentUserId }: MyReviewsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'received' | 'given'>('received');
  const [receivedReviews, setReceivedReviews] = useState<RoommateReview[]>([]);
  const [givenReviews, setGivenReviews] = useState<RoommateReview[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [currentUserId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch reviews received
      const receivedData = await getReviews({ reviewedId: currentUserId });
      setReceivedReviews(receivedData.reviews);

      // Fetch all roommates to get reviews given
      const roommatesData = await getRoommates({ 
        userId: currentUserId,
        activeOnly: false 
      });
      setRoommates(roommatesData.roommates);

      // Fetch all reviews given by current user
      const givenReviewsPromises = roommatesData.roommates
        .filter(r => r.user1.id === currentUserId || r.user2.id === currentUserId)
        .map(async (roommate) => {
          const otherUserId = roommate.user1.id === currentUserId 
            ? roommate.user2.id 
            : roommate.user1.id;
          
          try {
            const reviews = await getReviews({ 
              reviewedId: otherUserId,
              roommateId: roommate.id 
            });
            return reviews.reviews.filter(r => r.reviewerId === currentUserId);
          } catch {
            return [];
          }
        });

      const allGivenReviews = (await Promise.all(givenReviewsPromises)).flat();
      setGivenReviews(allGivenReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = async (
    reviewId: string,
    rating: number,
    comment?: string
  ) => {
    await updateReview(reviewId, {
      reviewerId: currentUserId,
      rating,
      comment,
    });
    await fetchAllData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReview(reviewId, { reviewerId: currentUserId });
    await fetchAllData();
  };

  const calculateAverageRating = (reviews: RoommateReview[]): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Get roommate info for a review
  const getRoommateInfo = (review: RoommateReview) => {
    const roommate = roommates.find(r => r.id === review.roommateId);
    if (!roommate) return null;

    return {
      startDate: roommate.startDate,
      endDate: roommate.endDate,
      isActive: roommate.isActive,
    };
  };

  return (
    <div className='bg-white rounded-xl shadow-sm p-8'>
      {/* Header with Average Rating */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>⭐ My Reviews</h2>
        
        {/* Average Rating Card */}
        {receivedReviews.length > 0 && (
          <div className='bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Your Average Rating</p>
                <div className='flex items-center gap-3'>
                  <span className='text-5xl font-bold text-yellow-500'>
                    {calculateAverageRating(receivedReviews).toFixed(1)}
                  </span>
                  <div>
                    {renderStars(Math.round(calculateAverageRating(receivedReviews)))}
                    <p className='text-sm text-gray-600 mt-1'>
                      Based on {receivedReviews.length} {receivedReviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className='flex gap-2 mb-6 border-b border-gray-200'>
        <button
          onClick={() => setActiveSubTab('received')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeSubTab === 'received'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📥 Received ({receivedReviews.length})
        </button>
        <button
          onClick={() => setActiveSubTab('given')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeSubTab === 'given'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📤 Given ({givenReviews.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className='text-center py-12 text-gray-500'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p>Loading reviews...</p>
        </div>
      ) : (
        <>
          {/* Received Reviews */}
          {activeSubTab === 'received' && (
            <div className='space-y-4'>
              {receivedReviews.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  <p className='text-4xl mb-4'>📝</p>
                  <p className='text-lg'>No reviews received yet</p>
                  <p className='text-sm mt-2'>Reviews from your roommates will appear here</p>
                </div>
              ) : (
                receivedReviews.map((review) => {
                  const roommateInfo = getRoommateInfo(review);
                  return (
                    <div key={review.id} className='border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition'>
                      {/* Roommate Period Info */}
                      {roommateInfo && (
                        <div className='mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg'>
                          📅 Roommates: {new Date(roommateInfo.startDate).toLocaleDateString()} - {
                            roommateInfo.endDate 
                              ? new Date(roommateInfo.endDate).toLocaleDateString()
                              : 'Present'
                          }
                        </div>
                      )}
                      <ReviewCard
                        review={review}
                        currentUserId={currentUserId}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Given Reviews */}
          {activeSubTab === 'given' && (
            <div className='space-y-4'>
              {givenReviews.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  <p className='text-4xl mb-4'>✍️</p>
                  <p className='text-lg'>No reviews written yet</p>
                  <p className='text-sm mt-2'>Reviews you write will appear here</p>
                </div>
              ) : (
                givenReviews.map((review) => {
                  const roommateInfo = getRoommateInfo(review);
                  return (
                    <div key={review.id} className='border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition'>
                      {/* Reviewed User Info */}
                      <div className='mb-3 flex items-center gap-3 bg-purple-50 px-4 py-3 rounded-lg'>
                        <div className='w-12 h-12 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden'>
                          {review.reviewed?.avatarURL ? (
                            <img
                              src={review.reviewed.avatarURL}
                              alt={review.reviewed.legalName || review.reviewed.email}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            (review.reviewed?.legalName?.[0] || review.reviewed?.email[0] || 'U').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            Review for: {review.reviewed?.legalName || review.reviewed?.email || 'Unknown'}
                          </p>
                          {review.reviewed?.email && (
                            <p className='text-sm text-gray-600'>{review.reviewed.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Roommate Period Info */}
                      {roommateInfo && (
                        <div className='mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg'>
                          📅 Roommates: {new Date(roommateInfo.startDate).toLocaleDateString()} - {
                            roommateInfo.endDate 
                              ? new Date(roommateInfo.endDate).toLocaleDateString()
                              : 'Present'
                          }
                        </div>
                      )}

                      <ReviewCard
                        review={review}
                        currentUserId={currentUserId}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
