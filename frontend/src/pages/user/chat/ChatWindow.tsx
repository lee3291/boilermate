import MessageDisplay from './component/MessageDisplay';
import InputBar from './component/InputBar';

const fakeMessages = new Array(20).fill(0).map((_, i) => ({ id: `m-${i + 1}`, chatId: 'chat-1', senderId: i % 2 === 0 ? 'user-1' : 'user-2', content: `Fake message ${i + 1}`, createdAt: new Date().toISOString() }));

export default function ChatWindow({ chatId }: { chatId: string }) {
  const currentUser = 'user-1';
  const other = chatId === 'chat-1' ? 'user-2' : 'user-3';
  const msgs = fakeMessages.filter((m) => m.chatId === chatId);

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #e6e6e6', background: '#fff' }}>{`Chat with ${other}`}</header>
      <MessageDisplay messages={msgs} currentUser={currentUser} />
      <InputBar onSend={(t) => console.log('send', t)} />
    </main>
  );
}
