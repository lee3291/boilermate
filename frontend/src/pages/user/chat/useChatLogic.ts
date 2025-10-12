import { useCallback, useMemo, useState } from 'react';

type Message = { id: string; chatId: string; senderId: string; content: string; createdAt: string };
type Conversation = { id: string; otherUsernameId: string; preview: string };

export default function useChatLogic(initialUserId = '') {
  const [currentUser, setCurrentUser] = useState<string>(initialUserId);
  const [selectedChatId, setSelectedChatId] = useState<string>('chat-1');

  // fake conversations/messages for prototype
  const conversations: Conversation[] = useMemo(
    () =>
      new Array(8).fill(0).map((_, i) => ({ id: `chat-${i + 1}`, otherUsernameId: `user-${i + 2}`, preview: `Last message preview ${i + 1}` })),
    []
  );

  const initialMessages: Message[] = useMemo(
    () => new Array(40).fill(0).map((_, i) => ({ id: `m-${i + 1}`, chatId: `chat-${(i % 8) + 1}`, senderId: i % 2 === 0 ? 'user-1' : 'user-2', content: `Fake message ${i + 1}`, createdAt: new Date().toISOString() })),
    []
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const messagesFor = useCallback((chatId: string) => messages.filter((m) => m.chatId === chatId), [messages]);

  const sendMessage = useCallback((chatId: string, content: string) => {
    const id = `m-${Date.now()}`;
    const m: Message = { id, chatId, senderId: currentUser || 'user-1', content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, m]);
    return m;
  }, [currentUser]);

  const editMessage = useCallback((messageId: string, content: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content } : m)));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  return {
    currentUser,
    setCurrentUser,
    selectedChatId,
    setSelectedChatId,
    conversations,
    messages,
    messagesFor,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
