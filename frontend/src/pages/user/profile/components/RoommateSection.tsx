/**
 * RoommateSection Component
 * Section 4: Roommate preferences (I want...)
 * Similar to LifestyleSection but for what user wants in a roommate with edit functionality
 */

import { useState } from 'react';
import type { Preference, RoommatePreference } from '@/types/preferences/preference';
import PreferenceCard from './PreferenceCard';
import AddPreferenceModal from './AddPreferenceModal';
import EditPreferenceModal from './EditPreferenceModal';

interface RoommateSectionProps {
  allPreferences: Preference[];
  roommatePreferences: RoommatePreference[];
  onAddPreference: (preferenceId: string, importance: number, visibility: string) => Promise<void>;
  onUpdatePreference: (preferenceId: string, importance: number, visibility: string) => Promise<void>;
  onRemovePreference: (preferenceId: string) => Promise<void>;
  loading: boolean;
}

export default function RoommateSection({
  allPreferences,
  roommatePreferences,
  onAddPreference,
  onUpdatePreference,
  onRemovePreference,
  loading,
}: RoommateSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState<RoommatePreference | null>(null);

  // Get selected preference IDs
  const selectedPreferenceIds = new Set(roommatePreferences.map((p) => p.preferenceId));

  // Filter out already selected preferences
  const availablePreferences = allPreferences.filter(
    (pref) => !selectedPreferenceIds.has(pref.id)
  );

  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💫</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Ideal Roommate</h2>
            <p className="text-sm text-gray-500">What I'm looking for in a roommate</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          + Add Preference
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading preferences...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && roommatePreferences.length === 0 && (
        <div className="text-center py-12 px-4">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-600 text-lg mb-4">No roommate preferences added yet</p>
          <p className="text-gray-400 text-sm">Let us know what you're looking for in a roommate</p>
        </div>
      )}

      {/* Preferences Grid */}
      {!loading && roommatePreferences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roommatePreferences.map((roommatePref) => (
            <PreferenceCard
              key={roommatePref.id}
              preference={roommatePref.preference!}
              importance={roommatePref.importance}
              visibility={roommatePref.visibility}
              onEdit={() => setEditingPreference(roommatePref)}
              onRemove={() => onRemovePreference(roommatePref.preferenceId)}
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
        title="Add Roommate Preference"
        description="Select what you want in your ideal roommate"
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
