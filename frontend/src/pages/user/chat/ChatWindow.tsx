import MessageDisplay from './components/MessageDisplay';
import InputBar from './components/InputBar';
import GroupMembersSidebar from './components/GroupMembersSidebar';
import type { Chat, MessageWithStatus } from '@/types/chats/chat';
import { Users } from 'lucide-react';

export default function ChatWindow(props: {
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
  showGroupMembersSidebar?: boolean;
  onToggleGroupMembersSidebar?: () => void;
  onAddMembersClick?: () => void;
  onRemoveMember?: (chatId: string, userId: string) => Promise<void>;
  onLeaveGroup?: (chatId: string) => Promise<void>;
  onDeleteGroup?: (chatId: string) => Promise<void>;
  blockedBetween?: boolean;
}) {
  const {
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
    showGroupMembersSidebar,
    onToggleGroupMembersSidebar,
    onAddMembersClick,
    onRemoveMember,
    onLeaveGroup,
    onDeleteGroup,
    blockedBetween,
  } = props;

  const isGroupChat = selectedConversation?.isGroup ?? false;
  const isDM = selectedConversation?.isGroup === false && selectedConversation?.participants?.length === 2;
  const otherUserId = selectedConversation?.participants?.find(p => p.id !== currentUserId)?.id;
  const chatDisplayName = isGroupChat
      ? selectedConversation?.name ?? 'Unnamed Group'
      : otherUserId ?? 'Unknown User';

  if (!chatId) {
    return (
        <main className="flex-1 flex flex-col">
          <header className="px-4 py-3 border-b bg-white">Select a chat</header>
          <div className="flex-1 flex items-center justify-center">Please select a chat to begin</div>
        </main>
    );
  }

  return (
      <div className="flex-1 flex h-full">
        <div className="flex-1 flex flex-col">
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
            {isDM && blockedBetween ? (
                <div className="p-4 text-center text-red-500">You cannot send messages to this user</div>
            ) : (
                <InputBar
                    value={messageInput}
                    onChange={onInputChange}
                    onSend={() => onSend?.({})}
                    selectedFile={selectedFile}
                    onFileChange={onFileChange}
                    isUploading={isUploadingImage}
                />
            )}
          </div>
        </div>
        {isGroupChat &&
            showGroupMembersSidebar &&
            selectedConversation?.participants?.some(p => p.id === currentUserId && p.status === 'ACCEPTED') && (
                <GroupMembersSidebar
                    chatId={chatId ?? ''}
                    currentUserId={currentUserId ?? ''}
                    isAdmin={selectedConversation?.creatorId === currentUserId}
                    onClose={() => onToggleGroupMembersSidebar?.()}
                    onAddMembers={() => onAddMembersClick?.()}
                    onRemoveMember={async memberId => {
                      if (onRemoveMember) await onRemoveMember(chatId ?? '', memberId);
                    }}
                    onLeaveGroup={async () => {
                      if (onLeaveGroup) await onLeaveGroup(chatId ?? '');
                    }}
                    onDeleteGroup={async () => {
                      if (onDeleteGroup) await onDeleteGroup(chatId ?? '');
                    }}
                    members={selectedConversation?.participants
                        ?.filter(p => p.status === 'ACCEPTED')
                        .map(p => ({ id: p.id, email: p.email, status: p.status }))}
                />
            )}
      </div>
  );
}
