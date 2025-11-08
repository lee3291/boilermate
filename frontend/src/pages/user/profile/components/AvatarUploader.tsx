/**
 * AvatarUploader Component
 * Allows users to upload and change their profile avatar
 * Uses AWS S3 for storage (structure ready for future integration)
 */

import { useState, useRef } from 'react';

interface AvatarUploaderProps {
  currentAvatarUrl: string;
  onAvatarChange: (file: File) => void;
  isEditable?: boolean;
}

export default function AvatarUploader({
  currentAvatarUrl,
  onAvatarChange,
  isEditable = true,
}: AvatarUploaderProps) {
  const defaultSvg = (
    <svg
      className='h-full w-full text-gray-300'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <circle cx='12' cy='12' r='12' />
      <path
        d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
        fill='#A0AEC0'
      />
    </svg>
  );
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setMessage(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      setMessage(null);
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    setError(null);
    setMessage(null);
  };

  const handleClick = () => {
    if (isEditable) {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onAvatarChange(selectedFile);
      setMessage('Avatar updated successfully!');
      setSelectedFile(null);
      // Optionally reset preview to currentAvatarUrl after save
      // setPreviewUrl(currentAvatarUrl);
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setError('Failed to update avatar. Please try again.');
      setTimeout(() => setError(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Success/Error Message at top of viewport */}
      {(message || error) && (
        <div
          className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-center text-white shadow-lg transition-all ${message ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {message || error}
        </div>
      )}
      <div className='relative inline-block w-full'>
        {/* Avatar Image */}
        <div
          className={`relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-xl ${
            isEditable ? 'cursor-pointer' : ''
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt='Profile avatar'
              className='h-full w-full object-cover'
            />
          ) : (
            defaultSvg
          )}

          {/* Hover Overlay (only if editable) */}
          {isEditable && isHovering && (
            <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white transition-opacity'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mb-1 h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              <span className='text-xs font-semibold'>Change Photo</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        {isEditable && (
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
          />
        )}

        {/* Edit Badge (only if editable) */}
        {isEditable && (
          <button
            onClick={handleClick}
            className='absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transition-transform hover:scale-110'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
            </svg>
          </button>
        )}
      </div>
      {/* Save Button strictly below avatar */}
      {isEditable && selectedFile && (
        <div className='mt-4 flex w-full justify-center'>
          <button
            className='rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg'
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </>
  );
}
