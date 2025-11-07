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
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call parent handler with the file
    // Parent component will handle the upload to AWS S3
    onAvatarChange(file);
  };

  const handleClick = () => {
    if (isEditable) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className='relative inline-block'>
      {/* Avatar Image */}
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ${
          isEditable ? 'cursor-pointer' : ''
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        <img
          src={previewUrl}
          alt='Profile avatar'
          className='w-full h-full object-cover'
        />

        {/* Hover Overlay (only if editable) */}
        {isEditable && isHovering && (
          <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 mb-1'
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
          className='absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform'
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
  );
}
