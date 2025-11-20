/**
 * ReviewsSection Component
 * Displays all reviews with add review functionality
 */

import { useState, useEffect } from 'react';
import type { RoommateReview } from '@/types/roommate-review';
import type { Roommate } from '@/types/roommates';
import ReviewCard from './ReviewCard';
import {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} from '@/services/roommateReviewService';

interface ReviewsSectionProps {
  reviewedUserId: string;
  currentUserId: string;
  roommates: Roommate[]; // Past roommates to allow adding reviews
}

export default function ReviewsSection({
  reviewedUserId,
  currentUserId,
  roommates,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<RoommateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedRoommateId, setSelectedRoommateId] = useState<string>('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter roommates where current user can leave a review
  const eligibleRoommates = roommates.filter((r) => {
    const isMyRoommate =
      (r.user1.id === currentUserId && r.user2.id === reviewedUserId) ||
      (r.user2.id === currentUserId && r.user1.id === reviewedUserId);

    // Check if already reviewed this roommate period
    const alreadyReviewed = reviews.some(
      (review) =>
        review.roommateId === r.id && review.reviewerId === currentUserId
    );

    return isMyRoommate && !alreadyReviewed;
  });

  const canAddReview = eligibleRoommates.length > 0;

  useEffect(() => {
    fetchReviews();
  }, [reviewedUserId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews({ reviewedId: reviewedUserId });
      setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!selectedRoommateId || newRating < 1) {
      alert('Please select a roommate period and provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        reviewerId: currentUserId,
        reviewedId: reviewedUserId,
        roommateId: selectedRoommateId,
        rating: newRating,
        comment: newComment || undefined,
      });

      // Reset form and refresh
      setShowAddReview(false);
      setSelectedRoommateId('');
      setNewRating(0);
      setNewComment('');
      await fetchReviews();
    } catch (error: any) {
      console.error('Failed to add review:', error);
      alert(error?.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
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
    await fetchReviews();
  };

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReview(reviewId, { reviewerId: currentUserId });
    await fetchReviews();
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => interactive && setNewRating(star)}
            disabled={!interactive}
            className={`text-3xl transition ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className='rounded-2xl border-2 border-blue-200 bg-white p-8 shadow-lg'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='mb-2 text-3xl font-bold text-gray-900'>
            ⭐ Roommate Reviews
          </h2>
          <p className='text-gray-600'>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            {reviews.length > 0 && (
              <span className='ml-2 text-yellow-500 font-semibold'>
                {renderStars(Math.round(parseFloat(calculateAverageRating())))} {calculateAverageRating()} average
              </span>
            )}
          </p>
        </div>

        {/* Add Review Button */}
        {canAddReview && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-md'
          >
            {showAddReview ? '✕ Cancel' : '+ Add Review'}
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className='mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Write a Review
          </h3>

          {/* Select Roommate Period */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select Roommate Period
            </label>
            <select
              value={selectedRoommateId}
              onChange={(e) => setSelectedRoommateId(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>-- Choose a roommate period --</option>
              {eligibleRoommates.map((roommate) => (
                <option key={roommate.id} value={roommate.id}>
                  {new Date(roommate.startDate).toLocaleDateString()} -{' '}
                  {roommate.endDate
                    ? new Date(roommate.endDate).toLocaleDateString()
                    : 'Present'}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Rating *
            </label>
            {renderStars(newRating, true)}
          </div>

          {/* Comment */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Comment (optional)
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder='Share your experience as roommates...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
            />
            <p className='text-xs text-gray-500 mt-1'>
              {newComment.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddReview}
            disabled={submitting || !selectedRoommateId || newRating < 1}
            className='w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {submitting ? 'Submitting...' : '✓ Submit Review'}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className='text-center py-12 text-gray-500'>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <p className='text-4xl mb-4'>📝</p>
          <p className='text-lg'>No reviews yet</p>
          {canAddReview && (
            <p className='text-sm mt-2'>Be the first to leave a review!</p>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
