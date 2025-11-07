import React from 'react';

interface DeactivateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
      <div className='pointer-events-auto mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b p-6'>
          <h2 className='text-xl font-bold text-gray-800'>
            Deactivate Account
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 transition-colors hover:bg-gray-100'
          >
            <span className='text-2xl text-gray-500'>×</span>
          </button>
        </div>
        <div className='p-6'>
          <p className='mb-6 text-gray-700'>
            Are you sure you want to deactivate your account? You will be signed
            out and need to reactivate to use your account again.
          </p>
          <div className='flex justify-end gap-4'>
            <button
              className='rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
              onClick={onConfirm}
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateAccountModal;
