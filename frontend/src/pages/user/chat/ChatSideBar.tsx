import ConversationListItem from './components/ConversationListItem';
import CreateGroupButton from './components/CreateGroupButton';
import InvitationsButton from './components/InvitationsButton';
import type { Chat } from '@/types/chats/chat';

export default function ChatSideBar({
  conversations,
  selectedChatId,
  onSelect,
  loading,
  error,
  onCreateGroup,
  onViewInvitations,
  invitationsCount = 0,
}: {
  conversations?: Chat[];
  selectedChatId?: string | null;
  onSelect?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  onCreateGroup?: () => void;
  onViewInvitations?: () => void;
  invitationsCount?: number;
}) {
  return (
    <aside className="w-80 border-r bg-white flex flex-col">
      {/* Header with Chats title and action buttons */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="font-semibold">Chats</span>
        <div className="flex items-center gap-2">
          {onViewInvitations && (
            <InvitationsButton onClick={onViewInvitations} count={invitationsCount} />
          )}
          {onCreateGroup && <CreateGroupButton onClick={onCreateGroup} />}
        </div>
      </div>
      <div className="overflow-y-auto p-3 space-y-2">
        {loading && <div className="text-sm text-gray-500">Loading chats...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && (conversations ?? []).length === 0 && (
          <div className="text-sm text-gray-500">No conversations</div>
        )}
        {(conversations ?? []).map((c) => ( 
          <ConversationListItem
            key={c.id}
            chat={c}
            currentUserId={conversations && conversations.length > 0 ? undefined : undefined}
            selected={selectedChatId === c.id}
            onClick={() => onSelect?.(c.id)}
          />
        ))}
      </div>
    </aside>
  );
}
