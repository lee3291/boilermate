import MessageDisplay from './components/MessageDisplay';
import InputBar from './components/InputBar';
import type { Chat, MessageWithStatus } from '@/types/chats/chat';

export default function ChatWindow({
  chatId,
  currentUserId,
  messages,
  loadingMessages,
  error,
  messageInput,
  onInputChange,
  onSend,
  onEdit,
  onDelete,
  selectedConversation,
}: {
  chatId?: string | null;
  currentUserId?: string;
  messages?: MessageWithStatus[];
  loadingMessages?: boolean;
  error?: string | null;
  messageInput?: string;
  onInputChange?: (v: string) => void;
  onSend?: (opts?: { recipientId?: string }) => Promise<any>;
  onEdit?: (messageId: string, content: string) => Promise<boolean>;
  onDelete?: (messageId: string, forEveryone?: boolean) => Promise<boolean>;
  selectedConversation?: Chat | null;
}) {
  // placeholder when no chat is selected
  if (!chatId) {
    return (
      <main className="flex-1 flex flex-col">
        <header className="px-4 py-3 border-b bg-white">Select a chat</header>
        <div className="flex-1 flex items-center justify-center">Please select a chat to begin</div>
      </main>
    );
  }

  const other = (selectedConversation && (selectedConversation.userAId === currentUserId ? selectedConversation.userBId : selectedConversation.userAId)) || 'user';

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b bg-white">{`Chat with ${other}`}</header>
      {/* message list: flex-1 + overflow-auto so it scrolls inside the chat window, page stays fixed */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loadingMessages && <div className="p-4 text-sm text-gray-500">Loading messages...</div>}
        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
        {!loadingMessages && !error && (
          <MessageDisplay messages={messages ?? []} currentUser={currentUserId ?? ''} onEdit={onEdit ? (id, content) => onEdit(id, content) : undefined} onDelete={onDelete ? (id, forEveryone) => onDelete(id, forEveryone) : undefined} />
        )}
      </div>

      <InputBar
        value={messageInput}
        onChange={(v) => onInputChange?.(v)}
        onSend={() => onSend?.({ recipientId: selectedConversation ? (selectedConversation.userAId === currentUserId ? selectedConversation.userBId : selectedConversation.userAId) : undefined })}
      />
    </main>
  );
}
