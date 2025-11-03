/**
 * PreferenceCard Component
 * Individual preference card showing category, label, importance stars, and visibility
 * Beautiful card design with gradient accents and edit/remove buttons
 */

import type { Preference } from '@/types/preferences/preference';

interface PreferenceCardProps {
  preference: Preference;
  importance: number; // 1-5
  visibility: string; // PUBLIC or PRIVATE
  onEdit?: () => void; // Optional edit handler
  onRemove: () => void;
}

export default function PreferenceCard({
  preference,
  importance,
  visibility,
  onEdit,
  onRemove,
}: PreferenceCardProps) {
  // Get category emoji based on category
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

  // Get importance color gradient
  const getImportanceGradient = (level: number): string => {
    if (level >= 4) return 'from-red-400 to-pink-500';
    if (level >= 3) return 'from-orange-400 to-yellow-500';
    return 'from-blue-400 to-cyan-500';
  };

  return (
    <div className="group relative rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 border border-gray-200 hover:shadow-xl transition-all hover:scale-105">
      {/* Category Badge */}
      <div className="absolute -top-3 -left-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1 text-xs font-bold text-white shadow-md">
        {getCategoryEmoji(preference.category)} {preference.category}
      </div>

      {/* Action Buttons */}
      <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="h-8 w-8 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 flex items-center justify-center"
            title="Edit preference"
          >
            ✏️
          </button>
        )}
        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="h-8 w-8 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 flex items-center justify-center"
          title="Remove preference"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">{preference.label}</h3>

        {/* Importance Stars */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500">Importance:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= importance
                    ? `bg-gradient-to-r ${getImportanceGradient(importance)} bg-clip-text text-transparent`
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Visibility Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              visibility === 'PUBLIC'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {visibility === 'PUBLIC' ? '👁️ Public' : '🔒 Private'}
          </span>
        </div>
      </div>
    </div>
  );
}
