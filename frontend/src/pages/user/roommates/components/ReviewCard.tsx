/**
 * ReviewCard Component
 * Displays a single review with edit/delete options for the author
 */

import { useState } from 'react';
import type { RoommateReview } from '@/types/roommate-review';

interface ReviewCardProps {
  review: RoommateReview;
  currentUserId: string;
  onEdit: (reviewId: string, rating: number, comment?: string) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
}

export default function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment || '');
  const [loading, setLoading] = useState(false);

  const isMyReview = review.reviewerId === currentUserId;

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onEdit(review.id, editRating, editComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update review:', error);
      alert('Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setLoading(true);
    try {
      await onDelete(review.id);
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => interactive && setEditRating(star)}
            disabled={!interactive}
            className={`text-2xl transition ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${star <= (interactive ? editRating : rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md'>
      {/* Reviewer Info */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Avatar */}
          <div className='h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold overflow-hidden'>
            {review.reviewer?.avatarURL ? (
              <img
                src={review.reviewer.avatarURL}
                alt={review.reviewer.legalName || review.reviewer.email}
                className='w-full h-full object-cover'
              />
            ) : (
              (review.reviewer?.legalName || review.reviewer?.email || 'U')
                .charAt(0)
                .toUpperCase()
            )}
          </div>
          <div>
            <h4 className='font-semibold text-gray-800'>
              {review.reviewer?.legalName || review.reviewer?.email || 'Anonymous'}
            </h4>
            <p className='text-sm text-gray-500'>
              {new Date(review.createdAt).toLocaleDateString()}
              {review.createdAt !== review.updatedAt && ' (edited)'}
            </p>
          </div>
        </div>

        {/* Edit/Delete buttons for own reviews */}
        {isMyReview && !isEditing && (
          <div className='flex gap-2'>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className='px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50'
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className='px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50'
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      {isEditing ? (
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Rating
          </label>
          {renderStars(editRating, true)}
        </div>
      ) : (
        <div className='mb-3'>{renderStars(review.rating)}</div>
      )}

      {/* Comment */}
      {isEditing ? (
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Comment (optional)
          </label>
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder='Share your experience...'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
          />
          <p className='text-xs text-gray-500 mt-1'>
            {editComment.length}/1000 characters
          </p>
        </div>
      ) : (
        review.comment && (
          <p className='text-gray-700 leading-relaxed'>{review.comment}</p>
        )
      )}

      {/* Edit actions */}
      {isEditing && (
        <div className='flex gap-2 mt-4'>
          <button
            onClick={handleSaveEdit}
            disabled={loading || editRating < 1}
            className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium'
          >
            {loading ? 'Saving...' : '✓ Save'}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={loading}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 font-medium'
          >
            ✕ Cancel
          </button>
        </div>
      )}
    </div>
  );
}
