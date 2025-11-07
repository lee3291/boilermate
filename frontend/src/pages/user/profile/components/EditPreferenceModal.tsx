/**
 * EditPreferenceModal Component
 * Modal for editing importance and visibility of existing preferences
 * Appears when user clicks edit icon on a preference card
 */

import { useState } from 'react';
import type { Preference } from '@/types/preferences/preference';

interface EditPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preference: Preference;
  currentImportance: number;
  currentVisibility: string;
  onUpdate: (importance: number, visibility: string) => Promise<void>;
}

export default function EditPreferenceModal({
  isOpen,
  onClose,
  preference,
  currentImportance,
  currentVisibility,
  onUpdate,
}: EditPreferenceModalProps) {
  const [importance, setImportance] = useState(currentImportance);
  const [visibility, setVisibility] = useState(currentVisibility);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get category emoji
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      LIFESTYLE: '🌅',
      SOCIAL: '🎉',
      HABITS: '🔄',
      PETS: '🐾',
      CLEANLINESS: '✨',
      COOKING: '👨‍🍳',
      SCHEDULE: '⏰',
      MUSIC: '🎵',
      BUDGET: '💰',
    };
    return emojiMap[category] || '📌';
  };

  // Handle update
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(importance, visibility);
      onClose();
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getCategoryEmoji(preference.category)}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Preference</h2>
                <p className="text-sm text-gray-500 mt-1">{preference.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl text-gray-500">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 text-xs font-bold text-white">
              {preference.category}
            </span>
          </div>

          {/* Importance Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Importance Level: <span className="text-pink-600 font-bold">{importance}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
            <div className="flex gap-4">
              <button
                onClick={() => setVisibility('PUBLIC')}
                className={`flex-1 rounded-lg p-4 border-2 transition-all ${
                  visibility === 'PUBLIC'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-2">👁️</div>
                <div className="font-medium text-gray-800">Public</div>
                <div className="text-xs text-gray-500">Visible to matches</div>
              </button>
              <button
                onClick={() => setVisibility('PRIVATE')}
                className={`flex-1 rounded-lg p-4 border-2 transition-all ${
                  visibility === 'PRIVATE'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="font-medium text-gray-800">Private</div>
                <div className="text-xs text-gray-500">Only for matching</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg px-6 py-3 font-medium text-white transition-all ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
