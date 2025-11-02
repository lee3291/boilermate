import { X, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: string;
    email: string;
}

interface BlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    onSearchUsers: (query: string) => Promise<User[]>; // API search
    onBlockUsers: (userId: string) => Promise<void>;     // Block user API
}

export default function BlockModal({
                                                  isOpen,
                                                  onClose,
                                                  currentUserId,
                                                  onSearchUsers,
                                                  onBlockUsers,
                                              }: BlockModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);

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
            const filtered = results.filter(
                (u) => u.id !== currentUserId
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleBlock = async () => {
        if (!selectedUser) {
            alert('Please select a user to block');
            return;
        }

        setIsBlocking(true);
        try {
            await onBlockUsers(selectedUser.id);
            setSelectedUser(null);
            setSearchQuery('');
            setSearchResults([]);
            onClose();
        } catch (error) {
            console.error('Block error:', error);
            alert('Failed to block user');
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Block/Unblock</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Selected User */}
                    {selectedUser && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                    {selectedUser.email[0].toUpperCase()}
                                </div>
                                <span className="text-sm">{selectedUser.email}</span>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

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
                        onClick={handleBlock}
                        disabled={isBlocking || !selectedUser}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isBlocking ? 'Blocking...' : 'Block User'}
                    </button>
                </div>
            </div>
        </div>
    );
}
