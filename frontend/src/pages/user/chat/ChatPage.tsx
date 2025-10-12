import useChatLogic from './useChatLogic';
import ChatSideBar from './ChatSideBar';
import ChatWindow from './ChatWindow';
import FakeSignIn from './FakeSignIn';

export default function ChatPage() {
  const logic = useChatLogic('user-1');

    return (
      <div className="flex flex-col h-screen bg-gray-100">
        {/* top: sign-in / controls (full width) */}
        <div className="bg-white border-b px-4 py-3">
          <FakeSignIn onChange={logic.setCurrentUser} />
        </div>

        {/* bottom: chat area (full width) */}
        <div className="flex flex-1 w-full">
          <ChatSideBar selectedChatId={logic.selectedChatId} onSelect={logic.setSelectedChatId} />
          <ChatWindow chatId={logic.selectedChatId} />
        </div>
      </div>
    );
}
