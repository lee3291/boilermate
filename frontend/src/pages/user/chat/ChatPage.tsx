import { useAuth } from '@/contexts/AuthContext';
import useChatLogic from './useChatLogic';
import ChatSideBar from './ChatSideBar';
import ChatWindow from './ChatWindow';
import Navbar from '../components/Navbar';
import CreateGroupModal from './components/CreateGroupModal';
import CreateNormalChatModal from './components/CreateNormalChatModal';
import InvitationsModal from './components/InvitationsModal';
import BlockModal from './components/BlockModal';
import AddMembersModal from './components/AddMembersModal';

export default function ChatPage() {
  const { user } = useAuth();
  
  // ProtectedRoute ensures user exists
  const logic = useChatLogic(user!);

  // Get selected conversation
  const selectedConversation = logic.conversations.find((c) => c.id === logic.selectedChatId) ?? null;

    return (
      <div className="min-h-screen w-full bg-white">
        <Navbar />

        {/* Chat area */}
        <div className="flex h-[calc(100vh-96px)] w-full">
          {/* pass conversations/loading state to sidebar */}
          <ChatSideBar
              currentUserId={logic.user.id}
              conversations={logic.conversations}
              selectedChatId={logic.selectedChatId}
              onSelect={logic.setSelectedChatId}
              loading={logic.loadingChats}
              error={logic.error}
              onCreateGroup={() => logic.setShowCreateGroupModal(true)}
              onCreateNormalChat={() => logic.setShowCreateNormalChatModal(true)}
              onBlock={() => logic.setShowBlockModal(true)}
              onViewInvitations={() => logic.setShowInvitationsModal(true)}
              invitationsCount={logic.invitationsCount}
          />

          {/* find selected conversation to show header info */}
          <ChatWindow
            chatId={logic.selectedChatId ?? ''}
            currentUserId={logic.user.id}
            messages={logic.messages}
            loadingMessages={logic.loadingMessages}
            error={logic.error}
            messageInput={logic.messageInput}
            onInputChange={logic.handleInputChange}
            onSend={logic.send}
            onEdit={logic.edit}
            onDelete={logic.remove}
            selectedConversation={selectedConversation}
            selectedFile={logic.selectedFile}
            onFileChange={logic.handleFileChange}
            isUploadingImage={logic.isUploadingImage}

            //Polls
            onCreatePoll={logic.handleCreatePoll}
            onGetPolls={logic.handleGetPolls}
            onAddOption={logic.handleAddOption}
            onSubmitVotes={logic.handleSubmitVotes}

            //Emojis
            onAddReaction={logic.handleAddReaction}
            onRemoveReaction={logic.handleRemoveReaction}
            onGetReactionCount={logic.handleGetReactionCount}
            onGetReactions={logic.handleGetReactions}

            //Pinned msgs
            onPinMessage={logic.handlePinMessage}

            // Group chat props
            blockedBetween={logic.blockedBetween}
            showGroupMembersSidebar={logic.showGroupMembersSidebar}
            onToggleGroupMembersSidebar={() => logic.setShowGroupMembersSidebar(!logic.showGroupMembersSidebar)}
            onAddMembersClick={() => logic.setShowAddMembersModal(true)}
            onRemoveMember={logic.handleRemoveMember}
            onLeaveGroup={logic.handleLeaveGroup}
            onDeleteGroup={logic.handleDeleteGroup}
          />
        </div>

        {/* Modals */}
        <CreateGroupModal
          isOpen={logic.showCreateGroupModal}
          onClose={() => logic.setShowCreateGroupModal(false)}
          currentUserId={logic.user.id}
          onSearchUsers={logic.handleSearchUsers}
          onCreateGroup={logic.handleCreateGroup}
        />

          <CreateNormalChatModal
              isOpen={logic.showCreateNormalChatModal}
              onClose={() => logic.setShowCreateNormalChatModal(false)}
              currentUserId={logic.user.id}
              onSearchUsers={logic.handleSearchUsersForNormalChat}
              onCreateChat={logic.handleCreateNormalChat}
          />

          <BlockModal
              isOpen={logic.showBlockModal}
              onClose={() => logic.setShowBlockModal(false)}
              currentUserId={logic.user.id}
              onSearchUsers={logic.handleSearchUsersForBlock}
              onBlockUsers={logic.handleBlock}
              onUnblockUsers={logic.handleUnblock}
              //onGetBlockedList={logic.handleGetBlockedList}
          />

        <InvitationsModal
          isOpen={logic.showInvitationsModal}
          onClose={() => logic.setShowInvitationsModal(false)}
          invitations={logic.invitations}
          onAccept={logic.handleAcceptInvitation}
          onDecline={logic.handleDeclineInvitation}
          currentUserId={logic.user.id}
        />

        <AddMembersModal
          isOpen={logic.showAddMembersModal}
          onClose={() => logic.setShowAddMembersModal(false)}
          currentUserId={logic.user.id}
          chatId={logic.selectedChatId ?? ''}
          onSearchUsers={(query) => logic.handleSearchUsersForGroup(logic.selectedChatId ?? '', query)}
          onAddMember={logic.handleAddMember}
        />
      </div>
    );
}
