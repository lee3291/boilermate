// lightweight sidebar for chat list
import ConversationListItem from './component/ConversationListItem';

const fakeConversations = new Array(12).fill(0).map((_, i) => ({
  id: `chat-${i + 1}`,
  otherUsernameId: `user-${i + 2}`,
  preview: `Last message preview ${i + 1}`,
}));

export default function ChatSideBar({ selectedChatId, onSelect }: { selectedChatId?: string; onSelect?: (id: string) => void }) {
  return (
    <aside className="w-80 border-r bg-white flex flex-col">
      <div className="px-4 py-3 border-b font-semibold">Chats</div>
      <div className="overflow-y-auto p-3 space-y-2">
        {fakeConversations.map((c) => (
          <ConversationListItem
            key={c.id}
            otherUsernameId={c.otherUsernameId}
            preview={c.preview}
            selected={selectedChatId === c.id}
            onClick={() => onSelect?.(c.id)}
          />
        ))}
      </div>
    </aside>
  );
}
