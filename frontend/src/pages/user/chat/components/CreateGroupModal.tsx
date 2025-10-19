import { X, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  email: string; // Using email since username not available yet
  // name: string; // OLD - will be available later
  // avatarURL?: string; // OLD - will be available later
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSearchUsers: (query: string) => Promise<User[]>; // Search users function from API
  onCreateGroup: (groupName: string, participantIds: string[]) => Promise<void>;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  currentUserId,
  onSearchUsers,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearchUsers(query);
      // Filter out current user and already selected users
      const filtered = results.filter(
        (u) => u.id !== currentUserId && !selectedUsers.some((s) => s.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter((u) => u.id !== user.id));
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateGroup(groupName, selectedUsers.map((u) => u.id));
      // Reset and close
      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error('Create group error:', error);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create Group Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                            {user.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <UserPlus size={16} className="text-blue-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
