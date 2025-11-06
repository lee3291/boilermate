/**
 * LifestyleSection Component
 * Section 3: User's lifestyle preferences (I am...)
 * Interactive preference cards organized by category with edit functionality
 */

import { useState } from 'react';
import type { Preference, UserProfilePreference } from '@/types/preferences/preference';
import PreferenceCard from './PreferenceCard';
import AddPreferenceModal from './AddPreferenceModal';
import EditPreferenceModal from './EditPreferenceModal';

interface LifestyleSectionProps {
  allPreferences: Preference[];
  userPreferences: UserProfilePreference[];
  onAddPreference: (preferenceId: string, importance: number, visibility: string) => Promise<void>;
  onUpdatePreference: (preferenceId: string, importance: number, visibility: string) => Promise<void>;
  onRemovePreference: (preferenceId: string) => Promise<void>;
  loading: boolean;
}

export default function LifestyleSection({
  allPreferences,
  userPreferences,
  onAddPreference,
  onUpdatePreference,
  onRemovePreference,
  loading,
}: LifestyleSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState<UserProfilePreference | null>(null);

  // Get user's selected preference IDs for easy lookup
  const selectedPreferenceIds = new Set(userPreferences.map((p) => p.preferenceId));

  // Filter out already selected preferences
  const availablePreferences = allPreferences.filter(
    (pref) => !selectedPreferenceIds.has(pref.id)
  );

  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌟</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Lifestyle</h2>
            <p className="text-sm text-gray-500">Tell others about yourself</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          + Add Preference
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading preferences...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && userPreferences.length === 0 && (
        <div className="text-center py-12 px-4">
          <span className="text-6xl mb-4 block">🎯</span>
          <p className="text-gray-600 text-lg mb-4">No lifestyle preferences added yet</p>
          <p className="text-gray-400 text-sm">Click "Add Preference" to start building your profile</p>
        </div>
      )}

      {/* Preferences Grid */}
      {!loading && userPreferences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userPreferences.map((userPref) => (
            <PreferenceCard
              key={userPref.id}
              preference={userPref.preference!}
              importance={userPref.importance}
              visibility={userPref.visibility}
              onEdit={() => setEditingPreference(userPref)}
              onRemove={() => onRemovePreference(userPref.preferenceId)}
            />
          ))}
        </div>
      )}

      {/* Add Preference Modal */}
      <AddPreferenceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        availablePreferences={availablePreferences}
        onAdd={onAddPreference}
        title="Add Lifestyle Preference"
        description="Select preferences that describe you"
      />

      {/* Edit Preference Modal */}
      {editingPreference && (
        <EditPreferenceModal
          isOpen={!!editingPreference}
          onClose={() => setEditingPreference(null)}
          preference={editingPreference.preference!}
          currentImportance={editingPreference.importance}
          currentVisibility={editingPreference.visibility}
          onUpdate={async (importance, visibility) => {
            await onUpdatePreference(editingPreference.preferenceId, importance, visibility);
            setEditingPreference(null);
          }}
        />
      )}
    </div>
  );
}
