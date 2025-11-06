/**
 * AddPreferenceModal Component
 * Modal for selecting and adding new preferences
 * Features category filtering, importance slider, and visibility toggle
 */

import { useState, useMemo } from 'react';
import type { Preference } from '@/types/preferences/preference';

interface AddPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePreferences: Preference[];
  onAdd: (preferenceId: string, importance: number, visibility: string) => Promise<void>;
  title: string;
  description: string;
}

export default function AddPreferenceModal({
  isOpen,
  onClose,
  availablePreferences,
  onAdd,
  title,
  description,
}: AddPreferenceModalProps) {
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(null);
  const [importance, setImportance] = useState(3);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(availablePreferences.map((p) => p.category));
    return Array.from(cats).sort();
  }, [availablePreferences]);

  // Filter preferences by selected category
  const filteredPreferences = useMemo(() => {
    if (!selectedCategory) return availablePreferences;
    return availablePreferences.filter((p) => p.category === selectedCategory);
  }, [availablePreferences, selectedCategory]);

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

  // Handle add preference
  const handleAdd = async () => {
    if (!selectedPreferenceId) return;

    setIsSubmitting(true);
    try {
      await onAdd(selectedPreferenceId, importance, visibility);
      // Reset form
      setSelectedPreferenceId(null);
      setImportance(3);
      setVisibility('PUBLIC');
      setSelectedCategory(null);
      onClose();
    } catch (error) {
      console.error('Error adding preference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryEmoji(cat)} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Preference Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Preference
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
              {filteredPreferences.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => setSelectedPreferenceId(pref.id)}
                  className={`rounded-lg p-4 text-left border-2 transition-all ${
                    selectedPreferenceId === pref.id
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryEmoji(pref.category)}</span>
                    <span className="text-xs font-medium text-gray-500">{pref.category}</span>
                  </div>
                  <div className="font-medium text-gray-800">{pref.label}</div>
                </button>
              ))}
            </div>
            {filteredPreferences.length === 0 && (
              <p className="text-center text-gray-400 py-8">No preferences available</p>
            )}
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
            onClick={handleAdd}
            disabled={!selectedPreferenceId || isSubmitting}
            className={`flex-1 rounded-lg px-6 py-3 font-medium text-white transition-all ${
              !selectedPreferenceId || isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Preference'}
          </button>
        </div>
      </div>
    </div>
  );
}
