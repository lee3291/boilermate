import { useState, useEffect, useCallback } from "react";
import MessageDisplay from './components/MessageDisplay';
import InputBar from './components/InputBar';
import GroupMembersSidebar from './components/GroupMembersSidebar';
import PollsSidebar from './components/PollsSidebar';
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
  onCreatePoll?: (chatId: string, question: string, options: string[]) => Promise<boolean>;
  onGetPolls?: (chatId: string, userId: string) => Promise<{ id: string; question: string; options: { id: string; text: string; votes: number; votedByUser: boolean; }[] }[]>;
  onAddOption: (pollId: string, optionText: string) => Promise<any>;
  onSubmitVotes: (pollId: string, opts: { id: string; selected: boolean }[]) => Promise<any>;
  onAddReaction: (messageId: string, userId:string, reaction: string) => Promise<any>;
  onRemoveReaction: (messageId: string) => Promise<any>;
  onGetReactions: (messageId: string) => Promise<any[]>;
  onGetReactionCount: (messageId: string) => Promise<number>;
  onPinMessage: (chatId: string, messageId: string, userId: string) => Promise<boolean>;
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
    onCreatePoll,
    onGetPolls,
    onAddOption,
    onSubmitVotes,
    onAddReaction,
    onRemoveReaction,
    onGetReactions,
    onGetReactionCount,
      onPinMessage,
  } = props;

  const [polls, setPolls] = useState<{ id: string; question: string; options: { id: string; text: string; votes: number; votedByUser: boolean;}[] }[]>([]);
  const [showPollsSidebar, setShowPollsSidebar] = useState(false);

  // Fetch polls from backend
  const handleFetchPolls = useCallback(async () => {
    if (!onGetPolls || !chatId || !currentUserId) return;
    try {
      const result = await onGetPolls(chatId, currentUserId);
      setPolls(result || []);
    } catch (err) {}
  }, [chatId, onGetPolls, currentUserId]);

  // Create a new poll
  const handleCreatePoll = async (poll: { question: string; options: string[] }) => {
    if (!onCreatePoll || !chatId) return;
    const success = await onCreatePoll(chatId, poll.question, poll.options);
    if (success) await handleFetchPolls();
  };

  // Add a new option to a poll and close the sidebar immediately
  const handleAddOption = async (pollId: string, optionText: string) => {
    if (!onAddOption) return;
    await onAddOption(pollId, optionText);
    setShowPollsSidebar(false);
  };

  useEffect(() => {
    if (chatId && selectedConversation?.isGroup) handleFetchPolls();
  }, [chatId, selectedConversation, handleFetchPolls]);

  const isGroupChat = selectedConversation?.isGroup ?? false;
  const isDM = selectedConversation?.isGroup === false && selectedConversation?.participants?.length === 2;
  const otherUser = selectedConversation?.participants?.find(p => p.id !== currentUserId);
  const chatDisplayName = isGroupChat ? selectedConversation?.name ?? 'Unnamed Group' : otherUser?.email ?? 'Unknown User';

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
          {/* Header */}
          <header className="flex-none h-12 px-4 py-3 border-b bg-white flex items-center justify-between">
            <span className="font-medium">{chatDisplayName}</span>
            {isGroupChat && onToggleGroupMembersSidebar && (
                <button onClick={onToggleGroupMembersSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Users size={20} />
                </button>
            )}
          </header>

          {/* Messages */}
          <div className="flex-1 min-h-0 relative bg-gray-50 overflow-y-auto">
            {loadingMessages && <div className="p-4 text-sm text-gray-500">Loading messages...</div>}
            {error && <div className="p-4 text-sm text-red-500">{error}</div>}
            {!loadingMessages && !error && (
                <div className="flex flex-col p-4 space-y-4">
                  <MessageDisplay
                      messages={messages ?? []}
                      currentUser={currentUserId ?? ''}
                      chatId={chatId ?? ''}
                      participants={selectedConversation?.participants ?? []}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAddReaction={onAddReaction}
                      onRemoveReaction={onRemoveReaction}
                      onGetReactionCount={onGetReactionCount}
                      onGetReactions={onGetReactions}
                      onPinMessage={onPinMessage}
                  />
                </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-none">
            {isDM && blockedBetween ? (
                <div className="p-4 text-center text-red-500">You cannot send messages to this user</div>
            ) : (
                <InputBar
                    value={messageInput}
                    selectedConversation={selectedConversation}
                    onChange={onInputChange}
                    onSend={() => onSend?.({})}
                    selectedFile={selectedFile}
                    onFileChange={onFileChange}
                    isUploading={isUploadingImage}
                    onCreatePoll={handleCreatePoll}
                />
            )}
          </div>
        </div>

        {/* Group Members Sidebar */}
        {isGroupChat && showGroupMembersSidebar && selectedConversation?.participants?.some(p => p.id === currentUserId) && (
            <GroupMembersSidebar
                chatId={chatId}
                currentUserId={currentUserId ?? ''}
                isAdmin={selectedConversation?.creatorId === currentUserId}
                onClose={() => onToggleGroupMembersSidebar?.()}
                onAddMembers={() => onAddMembersClick?.()}
                onRemoveMember={async memberId => { if (onRemoveMember) await onRemoveMember(chatId, memberId); }}
                onLeaveGroup={async () => { if (onLeaveGroup) await onLeaveGroup(chatId); }}
                onDeleteGroup={async () => { if (onDeleteGroup) await onDeleteGroup(chatId); }}
                members={selectedConversation?.participants?.filter(p => p.status === 'ACCEPTED' || p.status === 'PENDING').map(p => ({
                  id: p.id,
                  email: p.email,
                  status: p.status,
                }))}
                onSeePolls={() => {
                  onToggleGroupMembersSidebar?.();
                  setShowPollsSidebar(true);
                  handleFetchPolls(); // fetch fresh polls
                }}
            />
        )}

        {/* Polls Sidebar */}
        {isGroupChat && showPollsSidebar && (
            <PollsSidebar
                polls={polls}
                onAddOption={handleAddOption} // adds option and closes sidebar
                onClose={() => setShowPollsSidebar(false)}
                onSubmitVotes={onSubmitVotes}
            />
        )}
      </div>
  );
}
