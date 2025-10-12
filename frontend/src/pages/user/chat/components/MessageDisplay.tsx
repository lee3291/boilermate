import Message from './Message';

export default function MessageDisplay({ messages, currentUser, onEdit, onDelete }: { messages: any[]; currentUser: string; onEdit?: (id: string, content: string) => void; onDelete?: (id: string, forEveryone?: boolean) => void }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col p-3">
      {/* messages are shown with latest at bottom because container is column-reverse */}
      {messages.map((m) => (
        <Message key={m.id} m={m} isMine={m.senderId === currentUser} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
