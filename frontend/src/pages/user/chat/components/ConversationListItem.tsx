import type { Chat } from '@/types/chats/chat';
import { Users } from 'lucide-react';

export default function ConversationListItem({ 
  chat,
  preview, 
  selected, 
  onClick, 
  currentUserId 
}: { 
  chat?: Chat | null;
  preview?: string; 
  selected?: boolean; 
  onClick?: () => void; 
  currentUserId?: string;
}) {
  // OLD: DM-only logic with userAId/userBId
  // derive a simple badge from otherUsernameId or from other user part of chat id
  // const badge = otherUsernameId ? otherUsernameId.split('-')[1] : chat ? (chat.userAId.split('-')[1] === '1' ? chat.userBId.split('-')[1] : chat.userAId.split('-')[1]) : '?';
  // derive title using provided currentUserId when available; otherwise fall back to simple heuristic
  // const title = otherUsernameId ?? (chat ? (currentUserId ? (chat.userAId === currentUserId ? chat.userBId : chat.userAId) : (chat.userAId === 'user-1' ? chat.userBId : chat.userAId)) : 'Unknown');

  // NEW: Support both DM and Group chats
  const isGroupChat = chat?.isGroup ?? false;
  
  // Display name: For groups show name, for DMs show other user's name
  const displayName = isGroupChat
      ? (chat?.name ?? 'Unnamed Group')
      : (chat?.participants?.find(p => p.id !== currentUserId)?.id ?? 'Unknown User');


  // Badge/Avatar: For groups use first letter of name, for DMs use user badge
  const avatarContent = isGroupChat
      ? (chat?.name?.[0]?.toUpperCase() ?? 'G')
      : (chat?.participants?.find(p => p.id !== currentUserId)?.id?.[0]?.toUpperCase() ?? 'U');

  const avatarColor = isGroupChat ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

  return (
    <div onClick={onClick} className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center mr-3 flex-shrink-0`}>
        {isGroupChat ? (
          <Users size={20} />
        ) : (
          <span className="font-bold">{avatarContent}</span>
        )}
      </div>
      
      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{displayName}</div>
        <div className="text-gray-500 text-sm truncate">{preview ?? 'No messages yet'}</div>
      </div>
    </div>
  );
}
