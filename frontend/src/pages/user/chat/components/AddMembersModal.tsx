import { X, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  avatarURL?: string;
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  chatId: string;
  onSearchUsers: (query: string) => Promise<User[]>; // MOCK FUNCTION - you will implement later
  onAddMember: (chatId: string, userId: string) => Promise<void>;
}

export default function AddMembersModal({
  isOpen,
  onClose,
  currentUserId,
  chatId,
  onSearchUsers,
  onAddMember,
}: AddMembersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

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
      // Filter out current user
      const filtered = results.filter((u) => u.id !== currentUserId);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = async (user: User) => {
    setAddingUserId(user.id);
    try {
      await onAddMember(chatId, user.id);
      // Remove from search results after adding
      setSearchResults(searchResults.filter((u) => u.id !== user.id));
      alert(`${user.name} has been invited to the group`);
    } catch (error) {
      console.error('Add member error:', error);
      alert('Failed to add member');
    } finally {
      setAddingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Add Members</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users to add..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                            {user.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <button
                          onClick={() => handleAddUser(user)}
                          disabled={addingUserId === user.id}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          {addingUserId === user.id ? (
                            'Adding...'
                          ) : (
                            <>
                              <UserPlus size={14} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
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
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
