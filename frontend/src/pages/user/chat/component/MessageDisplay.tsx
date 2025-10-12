import Message from './Message';

export default function MessageDisplay({ messages, currentUser }: { messages: any[]; currentUser: string }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col-reverse p-3">
      {/* messages are shown with latest at bottom because container is column-reverse */}
      {messages.map((m) => (
        <Message key={m.id} m={m} isMine={m.senderId === currentUser} />
      ))}
    </div>
  );
}
