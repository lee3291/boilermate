import { X, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import { useState } from 'react';
// import { Crown } from 'lucide-react'; // TODO: Re-enable when we can identify creator

interface Member {
  id: string;
  email: string; // Using email for now, will be name later
  status?: string; // ACCEPTED, PENDING, DECLINED
  // name: string; // OLD - will be available later
  // avatarURL?: string; // OLD - will be available later
}

interface GroupMembersSidebarProps {
  chatId: string;
  currentUserId: string;
  isAdmin: boolean; // Pass this directly from parent
  onClose: () => void;
  onAddMembers: () => void; // Opens AddMembersModal
  onRemoveMember?: (memberId: string) => Promise<void>;
  onLeaveGroup?: () => Promise<void>; // Leave group chat (any member)
  onDeleteGroup?: () => Promise<void>; // Delete entire group chat (creator only)
  members?: Member[]; // Optional, pass participants from selectedConversation
}

export default function GroupMembersSidebar({
  // chatId, // Not used yet but keeping for future use
  currentUserId,
  isAdmin,
  onClose,
  members = [], // Default to empty array if not provided
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  onDeleteGroup,
}: GroupMembersSidebarProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const handleRemove = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from the group?`)) return;

    setRemovingId(memberId);
    try {
      await onRemoveMember?.(memberId);
    } catch (error) {
      console.error('Remove member error:', error);
      alert('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const handleLeaveGroup = async () => {
    const confirmMessage = isAdmin 
      ? 'Are you sure you want to leave this group? Admin rights will be transferred to the first remaining member. You will need to be re-invited to join again.'
      : 'Are you sure you want to leave this group? You will need to be re-invited to join again.';
    
    if (!confirm(confirmMessage)) return;

    setIsLeavingGroup(true);
    try {
      await onLeaveGroup?.();
    } catch (error) {
      console.error('Leave group error:', error);
      alert('Failed to leave group');
    } finally {
      setIsLeavingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone and will remove all messages.')) return;

    setIsDeletingGroup(true);
    try {
      await onDeleteGroup?.();
    } catch (error) {
      console.error('Delete group error:', error);
      alert('Failed to delete group');
    } finally {
      setIsDeletingGroup(false);
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
            onClick={onAddMembers}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={18} />
            Add Members
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        {members.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No members to display yet
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              // NOTE: We don't have creatorId in member data yet, so canRemove logic is simplified
              const isCurrentUser = member.id === currentUserId;
              const canRemove = isAdmin && !isCurrentUser; // TODO: Add !isMemberCreator when we have creator data

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
                      {/* TODO: Add crown icon when we can identify creator */}
                      {/* {isMemberCreator && (
                        <Crown size={14} className="text-yellow-500 flex-shrink-0" />
                      )} */}
                      {isCurrentUser && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                      {/* Show status badge if not ACCEPTED */}
                      {member.status && member.status !== 'ACCEPTED' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          member.status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {member.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button (Admin only) */}
                {canRemove && (
                  <button
                    onClick={() => handleRemove(member.id, member.email)}
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
        )}
      </div>

      {/* Action Buttons - At the bottom */}
      {onLeaveGroup && (
        <div className="p-4 border-t space-y-2">
          {/* Leave Group Button (All members including admin) */}
          <button
            onClick={handleLeaveGroup}
            disabled={isLeavingGroup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
            {isLeavingGroup ? 'Leaving...' : isAdmin ? 'Leave Group (Transfer Ownership)' : 'Leave Group'}
          </button>
          
          {/* Delete Group Button (Admin only) */}
          {isAdmin && onDeleteGroup && (
            <button
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              {isDeletingGroup ? 'Deleting...' : 'Delete Group'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
