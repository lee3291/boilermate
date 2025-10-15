import useChatLogic from './useChatLogic';
import ChatSideBar from './ChatSideBar';
import ChatWindow from './ChatWindow';
import FakeSignIn from './FakeSignIn';

export default function ChatPage() {
  const logic = useChatLogic('1');

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
            selectedConversation={logic.conversations.find((c) => c.id === logic.selectedChatId) ?? null}
            selectedFile={logic.selectedFile}
            onFileChange={logic.handleFileChange}
            isUploadingImage={logic.isUploadingImage}
          />
        </div>
      </div>
    );
}
