import MessageDisplay from './components/MessageDisplay';
import InputBar from './components/InputBar';
import GroupMembersSidebar from './components/GroupMembersSidebar';
import type { Chat, MessageWithStatus } from '@/types/chats/chat';
import { Users } from 'lucide-react';

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
  // Group chat props
  showGroupMembersSidebar,
  onToggleGroupMembersSidebar,
  onAddMembersClick,
  onRemoveMember,
  onLeaveGroup,
  onDeleteGroup,
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
  // Group chat props
  showGroupMembersSidebar?: boolean;
  onToggleGroupMembersSidebar?: () => void;
  onAddMembersClick?: () => void;
  onRemoveMember?: (chatId: string, userId: string) => Promise<void>;
  onLeaveGroup?: (chatId: string) => Promise<void>;
  onDeleteGroup?: (chatId: string) => Promise<void>;
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

  // OLD: Get the other user in DM (userAId/userBId)
  // const other = (selectedConversation && (selectedConversation.userAId === currentUserId ? selectedConversation.userBId : selectedConversation.userAId)) || 'user';

  // NEW: Support both DM and Group chats
  const isGroupChat = selectedConversation?.isGroup ?? false;
  const chatDisplayName = isGroupChat
      ? (selectedConversation?.name ?? 'Unnamed Group')
      : (selectedConversation?.participants?.find(p => p.id !== currentUserId)?.id ?? 'Unknown User');


  return (
    <div className="flex-1 flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header with group members toggle for group chats */}
        <header className="flex-none h-12 px-4 py-3 border-b bg-white flex items-center justify-between">
          <span className="font-medium">{chatDisplayName}</span>
          {isGroupChat && onToggleGroupMembersSidebar && (
            <button
              onClick={onToggleGroupMembersSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle group members"
            >
              <Users size={20} />
            </button>
          )}
        </header>
      {/* Message area with fixed max height */}
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

        {/* Input bar */}
        <div className="flex-none">
          <InputBar
            value={messageInput}
            onChange={onInputChange}
            onSend={() => {
              // For group chats, recipientId is not needed (sent to all participants)
              // For DMs, we need to determine the recipientId
              if (!selectedConversation) return onSend?.({});
              
              // OLD: DM logic with userAId/userBId
              // const recipientId = selectedConversation.userAId === currentUserId
              //   ? selectedConversation.userBId
              //   : selectedConversation.userAId;
              
              // NEW: For group chats, no recipientId needed (chatId is sufficient)
              // For DMs, recipientId will be handled by backend via chatId
              return onSend?.({});
            }}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
            isUploading={isUploadingImage}
          />
        </div>
      </div>

      {/* Group Members Sidebar (only shown for group chats) */}
      {isGroupChat && showGroupMembersSidebar && (
        <GroupMembersSidebar
          chatId={chatId ?? ''}
          currentUserId={currentUserId ?? ''}
          isAdmin={selectedConversation?.creatorId === currentUserId}
          onClose={() => onToggleGroupMembersSidebar?.()}
          onAddMembers={() => onAddMembersClick?.()}
          onRemoveMember={async (memberId) => {
            if (onRemoveMember) {
              await onRemoveMember(chatId ?? '', memberId);
            }
          }}
          onLeaveGroup={async () => {
            if (onLeaveGroup) {
              await onLeaveGroup(chatId ?? '');
            }
          }}
          onDeleteGroup={async () => {
            if (onDeleteGroup) {
              await onDeleteGroup(chatId ?? '');
            }
          }}
          members={selectedConversation?.participants?.map(p => ({
            id: p.id,
            email: p.email,
            status: p.status,
          }))}
        />
      )}
    </div>
  );
}
