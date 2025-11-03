import { X, UserMinus} from 'lucide-react';
import { useState } from 'react';

interface Member {
    id: string;
    email: string; // Using email for now, will be name later
    // name: string; // OLD - will be available later
    // avatarURL?: string; // OLD - will be available later
}

interface BlockedUsersSidebarProps {
    currentUserId: string;
    onClose: () => void;
    //onRemoveMember?: (memberId: string) => Promise<void>;
    members?: Member[]; // Optional, pass participants from selectedConversation
}

export default function BlockedUsersSidebar({currentUserId,
                                                onClose,
                                                members = [], // Default to empty array if not provided
                                                //onRemoveMember,
                                            }: BlockedUsersSidebarProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (memberId: string, memberEmail: string) => {
        if (!confirm(`Remove ${memberEmail} from the group?`)) return;

        setRemovingId(memberId);
        try {
            //await onRemoveMember?.(memberId);
        } catch (error) {
            console.error('Remove member error:', error);
            alert('Failed to remove member');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">
                    Blocked Users ({members.length})
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>


            {/* Blocked Users List */}
            <div className="flex-1 overflow-y-auto p-4">
                {members.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No users to display yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => {
                            // NOTE: We don't have creatorId in member data yet, so canRemove logic is simplified
                            const isCurrentUser = member.id === currentUserId;
                            const canRemove = !isCurrentUser; // TODO: Add !isMemberCreator when we have creator data

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            {member.email[0].toUpperCase()}
                                        </div>

                                        {/* Email and Role */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-900 truncate">
                                                 {member.email}
                                              </span>
                                                {isCurrentUser && (
                                                    <span className="text-xs text-gray-500">(You)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {canRemove && (
                                        <button
                                            onClick={() => handleRemove(member.id, member.email)}
                                            disabled={removingId === member.id}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            title="Remove blocked users"
                                        >
                                            {removingId === member.id ? (
                                                <span className="text-xs">...</span>
                                            ) : (
                                                <UserMinus size={16} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
