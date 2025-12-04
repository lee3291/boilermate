import { useState } from 'react';
import type { VerificationRequest } from '@/types/verification';
import {
  updateVerificationStatus,
  removeVerificationImage,
} from '@/services/verification.service';

interface VerificationReviewModalProps {
  request: VerificationRequest;
  onClose: () => void;
  onUpdate: (updatedRequest: VerificationRequest) => void;
}

const VerificationReviewModal = ({
  request,
  onClose,
  onUpdate,
}: VerificationReviewModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompleted = request.status !== 'PENDING';

  const handleAction = async (status: 'APPROVED' | 'DECLINED') => {
    if (isCompleted) return;

    const confirmationMessage =
      status === 'APPROVED'
        ? 'Are you sure you want to approve this request? The user will be notified with an email.'
        : 'Are you sure you want to decline this request? The user will be notified with an email.';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    if (status === 'DECLINED' && !reason.trim()) {
      setError('A reason is required to decline a request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedRequest = await updateVerificationStatus(
        request.id,
        status,
        reason,
      );
      // Remove image after status update
      await removeVerificationImage(request.id);
      // Set idImageURL to null in local state for immediate UI update
      onUpdate({ ...updatedRequest, idImageURL: null });
      onClose();
    } catch (err) {
      setError('Failed to update the request. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='bg-mainbrown relative w-full max-w-lg rounded-lg border border-gray-300 p-6 text-black shadow-lg'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-2xl font-bold text-gray-600 hover:text-gray-900'
          aria-label='Close modal'
        >
          &times;
        </button>

        <h2 className='mb-4 text-xl font-bold'>Review Verification</h2>
        <div className='mb-4'>
          <p>
            <strong>User:</strong>{' '}
            {request.user.legalName ? (
              <span
                className='inline-block max-w-[300px] truncate overflow-hidden whitespace-nowrap'
                title={request.user.legalName}
              >
                {request.user.legalName}
              </span>
            ) : (
              'N/A'
            )}
          </p>
        </div>

        <div className='mb-4'>
          <h3 className='mb-2 font-semibold'>ID Image:</h3>
          {!isCompleted && request.idImageURL ? (
            <img
              src={request.idImageURL}
              alt='User ID'
              className='max-h-80 w-full rounded-md object-contain'
            />
          ) : (
            <div className='text-gray-400 italic'>No image available.</div>
          )}
        </div>

        {isCompleted && request.reviewedBy && (
          <div className='mb-4 rounded-md bg-gray-100 p-3 text-sm'>
            <p>
              <strong>Reviewed by:</strong> {request.reviewedBy.email}
            </p>
            <p>
              <strong>On:</strong>{' '}
              {new Date(request.updatedAt).toLocaleString()}
            </p>
            {request.reason && (
              <p>
                <strong>Reason:</strong> {request.reason}
              </p>
            )}
          </div>
        )}

        <div className='mb-4'>
          <label htmlFor='reason' className='mb-1 block font-semibold'>
            Reason (Required for Decline):
          </label>
          <textarea
            id='reason'
            value={isCompleted ? request.reason || '' : reason}
            onChange={(e) => setReason(e.target.value)}
            className='w-full rounded border border-gray-300 bg-white p-2 text-black placeholder:text-gray-400 disabled:bg-gray-200'
            rows={3}
            placeholder='Enter reason for declining the request...'
            disabled={isCompleted}
          />
        </div>

        {error && <p className='mb-4 text-center text-red-500'>{error}</p>}

        {!isCompleted && (
          <div className='flex justify-end gap-4'>
            <button
              onClick={() => handleAction('DECLINED')}
              disabled={isSubmitting}
              className='rounded bg-red-400 px-4 py-2 text-white hover:bg-red-500 disabled:bg-gray-300'
            >
              {isSubmitting ? 'Declining...' : 'Decline'}
            </button>
            <button
              onClick={() => handleAction('APPROVED')}
              disabled={isSubmitting}
              className='rounded bg-green-400 px-4 py-2 text-white hover:bg-green-500 disabled:bg-gray-300'
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationReviewModal;
