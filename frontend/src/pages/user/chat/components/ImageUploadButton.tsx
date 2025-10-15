//TODO: this is the button user see to add the image to a message

import { useRef } from 'react';
import type { ChangeEvent } from 'react';

interface ImageUploadButtonProps {
  onFileChange: (file: File | null) => void; // callback to parent with selected file
  disabled?: boolean; // disable button during upload
  selectedFileName?: string; // display selected file name
}

export default function ImageUploadButton({ 
  onFileChange, 
  disabled = false,
  selectedFileName 
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null); // reference to hidden file input

  // handle when user selects a file
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null; // get first file or null
    onFileChange(file); // notify parent component
  };

  // trigger file input click when button is clicked
  const handleClick = () => {
    fileInputRef.current?.click(); // open file picker dialog
  };

  // clear selected file
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering file picker
    onFileChange(null); // clear file in parent
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // reset input value
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file input - only accepts image files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp" // restrict to image types
        onChange={handleChange}
        style={{ display: 'none' }} // hide the native input
        disabled={disabled}
      />

      {/* Visible upload button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="flex-none px-3 h-9 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach image"
      >
        📎
      </button>

      {/* Display selected file name with clear button */}
      {selectedFileName && (
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          <span className="truncate max-w-[150px]">{selectedFileName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700 font-bold"
            title="Remove file"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}