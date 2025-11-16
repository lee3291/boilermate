import { useEffect, useRef } from 'react';
import Message from './Message';

interface Participant {
  id: string;
  email: string;
  status: string;
}

export default function MessageDisplay({ 
  messages, 
  currentUser,
  participants, 
  onEdit, 
  onDelete 
}: { 
  messages: any[]; 
  currentUser: string;
  participants: Participant[]; 
  onEdit?: (id: string, content: string) => void; 
  onDelete?: (id: string, forEveryone: boolean) => void 
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto"
    >
      <div className="p-4 space-y-4">
        {messages.map((m) => (
          <Message 
            key={m.id} 
            m={m} 
            isMine={m.senderId === currentUser}
            currentUserId={currentUser}
            senderEmail={participants.find(p => p.id === m.senderId)?.email ?? m.senderId}
            onEdit={onEdit} 
            onDelete={onDelete}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
