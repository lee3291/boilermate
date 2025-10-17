import { X, UserPlus, UserMinus, Crown } from 'lucide-react';
import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  avatarURL?: string;
}

interface GroupMembersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[]; // MOCK - you will fetch real members later
  creatorId: string;
  currentUserId: string;
  chatId: string;
  onAddMember: () => void; // Opens AddMembersModal
  onRemoveMember: (memberId: string) => Promise<void>;
}

export default function GroupMembersSidebar({
  isOpen,
  onClose,
  members,
  creatorId,
  currentUserId,
  // chatId, // Not used yet but keeping for future use
  onAddMember,
  onRemoveMember,
}: GroupMembersSidebarProps) {
  const isAdmin = currentUserId === creatorId;
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the group?`)) return;

    setRemovingId(memberId);
    try {
      await onRemoveMember(memberId);
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
          Members ({members.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Add Member Button (Admin only) */}
      {isAdmin && (
        <div className="p-4 border-b">
          <button
            onClick={onAddMember}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={18} />
            Add Members
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {members.map((member) => {
            const isMemberCreator = member.id === creatorId;
            const isCurrentUser = member.id === currentUserId;
            const canRemove = isAdmin && !isMemberCreator && !isCurrentUser;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {member.name[0].toUpperCase()}
                  </div>

                  {/* Name and Role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </span>
                      {isMemberCreator && (
                        <Crown size={14} className="text-yellow-500 flex-shrink-0" />
                      )}
                      {isCurrentUser && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button (Admin only) */}
                {canRemove && (
                  <button
                    onClick={() => handleRemove(member.id, member.name)}
                    disabled={removingId === member.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Remove member"
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
      </div>
    </div>
  );
}
