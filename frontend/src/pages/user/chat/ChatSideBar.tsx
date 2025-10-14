import ConversationListItem from './components/ConversationListItem';
import type { Chat } from '@/types/chats/chat';

export default function ChatSideBar({
  conversations,
  selectedChatId,
  onSelect,
  loading,
  error,
}: {
  conversations?: Chat[];
  selectedChatId?: string | null;
  onSelect?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <aside className="w-80 border-r bg-white flex flex-col">
      <div className="px-4 py-3 border-b font-semibold">Chats</div>
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
