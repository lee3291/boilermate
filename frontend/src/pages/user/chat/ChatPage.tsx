import useChatLogic from './useChatLogic';
import ChatSideBar from './ChatSideBar';
import ChatWindow from './ChatWindow';
import FakeSignIn from './FakeSignIn';
import CreateGroupModal from './components/CreateGroupModal';
import InvitationsModal from './components/InvitationsModal';
import AddMembersModal from './components/AddMembersModal';

export default function ChatPage() {
  const logic = useChatLogic('1');

  // Get selected conversation
  const selectedConversation = logic.conversations.find((c) => c.id === logic.selectedChatId) ?? null;

    return (
      // h-screen + overflow-hidden prevents the browser page from scrolling vertically
      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
        {/* top: sign-in / controls (full width) */}
        <div className="bg-white border-b px-4 py-3">
          <FakeSignIn onChange={logic.setCurrentUserId} />
        </div>

        {/* bottom: chat area (full width) */}
        <div className="flex flex-1 w-full">
          {/* pass conversations/loading state to sidebar */}
          <ChatSideBar
            conversations={logic.conversations}
            selectedChatId={logic.selectedChatId}
            onSelect={logic.setSelectedChatId}
            loading={logic.loadingChats}
            error={logic.error}
            onCreateGroup={() => logic.setShowCreateGroupModal(true)}
            onViewInvitations={() => logic.setShowInvitationsModal(true)}
            invitationsCount={logic.invitationsCount}
          />

          {/* find selected conversation to show header info */}
          <ChatWindow
            chatId={logic.selectedChatId ?? ''}
            currentUserId={logic.currentUserId}
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
            // Group chat props
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
          currentUserId={logic.currentUserId}
          onSearchUsers={logic.handleSearchUsers}
          onCreateGroup={logic.handleCreateGroup}
        />

        <InvitationsModal
          isOpen={logic.showInvitationsModal}
          onClose={() => logic.setShowInvitationsModal(false)}
          invitations={logic.invitations}
          onAccept={logic.handleAcceptInvitation}
          onDecline={logic.handleDeclineInvitation}
        />

        <AddMembersModal
          isOpen={logic.showAddMembersModal}
          onClose={() => logic.setShowAddMembersModal(false)}
          currentUserId={logic.currentUserId}
          chatId={logic.selectedChatId ?? ''}
          onSearchUsers={(query) => logic.handleSearchUsersForGroup(logic.selectedChatId ?? '', query)}
          onAddMember={logic.handleAddMember}
        />
      </div>
    );
}
