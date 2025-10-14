import type { Chat } from '@/types/chats/chat';

export default function ConversationListItem({ chat, otherUsernameId, preview, selected, onClick, currentUserId }: { chat?: Chat; otherUsernameId?: string; preview?: string; selected?: boolean; onClick?: () => void; currentUserId?: string }) {
  // derive a simple badge from otherUsernameId or from other user part of chat id
  const badge = otherUsernameId ? otherUsernameId.split('-')[1] : chat ? (chat.userAId.split('-')[1] === '1' ? chat.userBId.split('-')[1] : chat.userAId.split('-')[1]) : '?';

  // derive title using provided currentUserId when available; otherwise fall back to simple heuristic
  const title = otherUsernameId ?? (chat ? (currentUserId ? (chat.userAId === currentUserId ? chat.userBId : chat.userAId) : (chat.userAId === 'user-1' ? chat.userBId : chat.userAId)) : 'Unknown');

  return (
    <div onClick={onClick} className={`p-3 rounded-lg flex items-center cursor-pointer ${selected ? 'bg-blue-50' : 'bg-transparent'}`}>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
        <span className="text-blue-700 font-bold">{badge}</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-gray-500 text-sm">{preview ?? ''}</div>
      </div>
    </div>
  );
}
