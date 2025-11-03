import { X, Search, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import BlockedUsersSidebar from './BlockedUsersSidebar';
import { getBlockedByUserId } from '@/services/chatService';

interface User {
    id: string;
    email?: string;
}

interface Member {
    id: string;
    email: string;
}

interface BlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    onSearchUsers: (query: string) => Promise<User[]>;
    onBlockUsers: (userId: string) => Promise<void>;
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
    const [showBlockedSidebar, setShowBlockedSidebar] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState<Member[]>([]);

    useEffect(() => {
        if (!showBlockedSidebar) return;
        const fetchBlocked = async () => {
            try {
                const response = await getBlockedByUserId(currentUserId);
                const users = response.users ?? [];
                const members: Member[] = users.map(u => ({
                    id: u.id,
                    email: u.email ?? `${u.id}@example.com`,
                }));
                setBlockedUsers(members);
            } catch (err) {
                console.error('Failed to fetch blocked users', err);
            }
        };
        fetchBlocked();
    }, [showBlockedSidebar, currentUserId]);

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
            setSearchResults(results.filter(u => u.id !== currentUserId));
        } catch (err) {
            console.error('Search error', err);
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
        if (!selectedUser) return alert('Select a user to block');
        setIsBlocking(true);
        try {
            await onBlockUsers(selectedUser.id);
            setSelectedUser(null);
            setSearchQuery('');
            setSearchResults([]);
            if (showBlockedSidebar) {
                const response = await getBlockedByUserId(currentUserId);
                const users = response.users ?? [];
                const members: Member[] = users.map(u => ({
                    id: u.id,
                    email: u.email ?? `${u.id}@example.com`,
                }));
                setBlockedUsers(members);
            }
        } catch (err) {
            console.error('Block error', err);
            alert('Failed to block user');
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] flex flex-col pointer-events-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Block/Unblock</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedUser && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                    {selectedUser.email?.[0].toUpperCase() ?? selectedUser.id[0]}
                                </div>
                                <span className="text-sm">{selectedUser.email ?? selectedUser.id}</span>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-red-500 hover:text-red-700">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {searchQuery && (
                            <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-500">Searching...</div>
                                ) : searchResults.length ? (
                                    <div className="divide-y">
                                        {searchResults.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleSelectUser(u)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {u.email?.[0].toUpperCase() ?? u.id[0]}
                                                    </div>
                                                    <span className="text-sm">{u.email ?? u.id}</span>
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
                <div className="p-4 border-t flex gap-2">
                    <button
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setShowBlockedSidebar(true)}
                    >
                        Manage Blocked Users
                    </button>
                    <button
                        onClick={handleBlock}
                        disabled={isBlocking || !selectedUser}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isBlocking ? 'Blocking...' : 'Block User'}
                    </button>
                    {showBlockedSidebar && (
                        <BlockedUsersSidebar
                            currentUserId={currentUserId}
                            onClose={() => setShowBlockedSidebar(false)}
                            members={blockedUsers}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
