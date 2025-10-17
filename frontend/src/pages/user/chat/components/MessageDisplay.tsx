import { useEffect, useRef } from 'react';
import Message from './Message';

export default function MessageDisplay({ 
  messages, 
  currentUser, 
  onEdit, 
  onDelete 
}: { 
  messages: any[]; 
  currentUser: string; 
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
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
