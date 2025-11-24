/**
 * BioSection Component
 * Section 2: User's biography/introduction
 * Clean card design with editable text area
 */

import { useState } from 'react';
import EditBioModal from './EditBioModal';

interface BioSectionProps {
  bio: string;
  legalName: string;
  phoneNumber: string;
  searchStatus: string;
  onSave: (data: {
    name: string;
    phone: string;
    bio: string;
    searchStatus: string;
  }) => Promise<void>;
  isEditable?: boolean;
}

export default function BioSection({
  bio,
  legalName,
  phoneNumber,
  searchStatus,
  onSave,
  isEditable = true,
}: BioSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className='mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg'>
      {/* Section Header */}
      <div className='mb-4 flex items-center gap-3'>
        <span className='text-3xl'>✨</span>
        <h2 className='text-2xl font-bold text-gray-800'>About Me</h2>
      </div>

      {/* Bio Text */}
      <div className='max-h-48 overflow-auto rounded-xl border border-pink-100 bg-linear-to-r from-pink-50 to-purple-50 p-6'>
        <p className='text-lg leading-relaxed wrap-break-word whitespace-pre-line text-gray-700'>
          {bio}
        </p>
      </div>

      {/* Edit Button */}
      {isEditable && (
        <div className='mt-4 flex justify-end'>
          <button
            className='rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-6 py-2 font-medium text-white shadow-md transition-shadow hover:shadow-lg'
            onClick={() => setIsModalOpen(true)}
          >
            ✏️ Edit Profile
          </button>
        </div>
      )}

      {/* Edit Bio Modal */}
      {isModalOpen && (
        <EditBioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialName={legalName}
          initialPhone={phoneNumber}
          initialBio={bio}
          initialSearchStatus={searchStatus}
          onSave={async (data) => {
            await onSave(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
