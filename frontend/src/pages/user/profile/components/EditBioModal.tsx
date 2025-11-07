/**
 * EditBioModal Component
 * Modal for editing legal name, phone number, bio, and roommate search status
 * Styled similarly to AddPreferenceModal
 */

import { useState } from 'react';

interface EditBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
  initialBio: string;
  initialSearchStatus: string;
  onSave: (data: {
    name: string;
    phone: string;
    bio: string;
    searchStatus: string;
  }) => Promise<void>;
}

export default function EditBioModal({
  isOpen,
  onClose,
  initialName,
  initialPhone,
  initialBio,
  initialSearchStatus,
  onSave,
}: EditBioModalProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [bio, setBio] = useState(initialBio);
  const [searchStatus, setSearchStatus] = useState(initialSearchStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave({ name, phone, bio, searchStatus });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='border-b border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-800'>Edit Profile Info</h2>
            <button
              onClick={onClose}
              className='rounded-full p-2 hover:bg-gray-100 transition-colors'
            >
              <span className='text-2xl text-gray-500'>×</span>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className='p-8'>
        <div className='mb-4'>
          <label className='mb-1 block font-medium text-gray-700'>
            Legal Name
          </label>
          <input
            className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter your legal name'
          />
        </div>
        <div className='mb-4'>
          <label className='mb-1 block font-medium text-gray-700'>
            Phone Number
          </label>
          <input
            className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='Enter your phone number'
          />
        </div>
        <div className='mb-4'>
          <label className='mb-1 block font-medium text-gray-700'>Bio</label>
          <textarea
            className='min-h-[80px] w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='Tell us about yourself'
          />
        </div>
        <div className='mb-6'>
          <label className='mb-1 block font-medium text-gray-700'>
            Roommate Search Status
          </label>
          <select
            className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none'
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
          >
            <option value='LOOKING'>Actively searching</option>
            <option value='NOT_LOOKING'>Not searching</option>
            <option value='HIDDEN'>Hidden from Searches</option>
          </select>
        </div>
        <div className='flex justify-end gap-3'>
          <button
            className='rounded-full bg-gray-200 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-300'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className='rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 font-medium text-white shadow-md transition-shadow hover:shadow-lg'
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
