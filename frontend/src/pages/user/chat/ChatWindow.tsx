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
  selectedFile,
  onFileChange,
  isUploadingImage,
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
  onDelete?: (messageId: string, forEveryone: boolean) => Promise<boolean>;
  selectedConversation?: Chat | null;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  isUploadingImage?: boolean;
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
    <div className="flex-1 flex flex-col h-full">
      <header className="flex-none h-12 px-4 py-3 border-b bg-white">
        <span>Chat with {other}</span>
      </header>
      {/* Message area with fixed max height */}
      <div className="flex-1 min-h-0 relative bg-gray-50">
        {loadingMessages && <div className="p-4 text-sm text-gray-500">Loading messages...</div>}
        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
        {!loadingMessages && !error && (
          <MessageDisplay 
            messages={messages ?? []} 
            currentUser={currentUserId ?? ''} 
            onEdit={onEdit} 
            onDelete={onDelete}
          />
        )}
      </div>

      <div className="flex-none">
        <InputBar
          value={messageInput}
          onChange={onInputChange}
          onSend={() => {
            if (!selectedConversation) return onSend?.({});
            const recipientId = selectedConversation.userAId === currentUserId
              ? selectedConversation.userBId
              : selectedConversation.userAId;
            return onSend?.({ recipientId });
          }}
          selectedFile={selectedFile}
          onFileChange={onFileChange}
          isUploading={isUploadingImage}
        />
      </div>
    </div>
  );
}
