import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getChats as apiGetChats,
  getHistory as apiGetHistory,
  sendMessage as apiSendMessage,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
} from '@/services/chatService';
import type {
  Chat,
  MessageWithStatus,
  getChatsRequest,
  getChatsResponse,
  getHistoryRequest,
  getHistoryResponse,
  sendMessageRequest,
  sendMessageResponse,
  editMessageRequest,
  deleteMessageRequest,
} from '@/types/chats/chat';

export default function useChatLogic(initialUserId: string) {
  const [currentUserId, setCurrentUserId] = useState<string>(initialUserId); // initialUserId allow pre-set in page
  const [conversations, setConversations] = useState<Chat[]>([]); // populate the chat sidebar
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null); // enable clicking for the chat sidebar, save state
  const [messages, setMessages] = useState<MessageWithStatus[]>([]); // set the message display part in the chat window
  const [messageInput, setMessageInput] = useState<string>(''); // set the message in the input bar
  const [loadingChats, setLoadingChats] = useState(false); // set loading state when fetching all chatIds in side bar
  const [loadingMessages, setLoadingMessages] = useState(false); // set loading state when fetching all the messages in chat window
  const [error, setError] = useState<string | null>(null); // set error state when handling events

  // fetch all chats for current user
  const fetchChats = useCallback(async (userId?: string) => {
    console.log('check chat fetching')

    if (!userId) return;
    setLoadingChats(true);
    setError(null);
    try {
      const req: getChatsRequest = { userId };

      console.log('chat fetch wtf happen here ????', req)
      const res: getChatsResponse = await apiGetChats(req);
      console.log('the hell ???')
      setConversations(res.chats || []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // fetch history for selected chat and current user
  const fetchHistory = useCallback(
    async (chatId?: string, userId?: string) => {
      if (!chatId || !userId) return;
      setLoadingMessages(true);
      setError(null);
      try {
        const req: getHistoryRequest = { userId };
        const res: getHistoryResponse = await apiGetHistory(chatId, req);
        setMessages(res.messages || []);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  // When currentUserId changes fetch chats, this should be deleted in the future
  useEffect(() => {
    if (!currentUserId) return;
    fetchChats(currentUserId);
  }, [currentUserId, fetchChats]);

  // When selected chat changes fetch its history
  useEffect(() => {
    if (!selectedChatId || !currentUserId) {
      setMessages([]);
      return;
    }
    fetchHistory(selectedChatId, currentUserId);
  }, [selectedChatId, currentUserId, fetchHistory]);

  // handle input change, useCallback just for fun literally
  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);
  }, []);

  // send message (handles both existing chat and first-time if needed)
  const send = useCallback(
    async (overrides?: { recipientId?: string }) => {
      if (!currentUserId) {
        setError('senderId required');
        return null;
      }

      // trim to remove trailing whitespace
      if (!messageInput?.trim()) return null;
      setError(null);

      try {
        // build the request
        const payload: sendMessageRequest = {
          chatId: selectedChatId ?? undefined,
          senderId: currentUserId,
          recipientId: overrides?.recipientId,
          content: messageInput.trim(),
        };

        const res: sendMessageResponse = await apiSendMessage(payload);

        // update messages list (append)
        if (res?.message) {
          // have to copy ...prev to make state pure
          setMessages((prev) => [...prev, res.message]);
        }
        // if a new chat was created, add it to conversations and select it
        if (res?.chat) {
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === res.chat.id);
            if (exists) return prev;
            return [res.chat, ...prev]; // add new chat to top of the conversation list
          });
          if (!selectedChatId) { // set selected id to new chat
            setSelectedChatId(res.chat.id);
          }
        }
        setMessageInput('');
        return res;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to send message');
        return null;
      }
    },
    [currentUserId, messageInput, selectedChatId]
  );

  // edit a message (only updates local state after API call)
  const edit = useCallback(
    async (messageId: string, content: string) => {
      if (!currentUserId) {
        setError('userId required');
        return false;
      }

      try {
        const req: editMessageRequest = { content, userId: currentUserId };
        await apiEditMessage(messageId, req);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content, isEdited: true } : m))
        );
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to edit message');
        return false;
      }
    },
    [currentUserId]
  );

  // delete a message (forEveryone toggles message.isDeleted, otherwise mark isDeletedForYou)
  const remove = useCallback(
    async (messageId: string, forEveryone = false) => {
      if (!currentUserId) {
        setError('userId required');
        return false;
      }
      try {
        const req: deleteMessageRequest = { userId: currentUserId, forEveryone };
        await apiDeleteMessage(messageId, req);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? forEveryone
                ? { ...m, isDeleted: true }
                : { ...m, isDeletedForYou: true }
              : m
          )
        );
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete message');
        return false;
      }
    },
    [currentUserId]
  );

  const messagesForSelected = useMemo(() => messages, [messages]);

  return {
    // state
    currentUserId,
    setCurrentUserId,
    conversations,
    selectedChatId,
    setSelectedChatId,
    messages: messagesForSelected,
    messageInput,

    // status
    loadingChats,
    loadingMessages,
    error,

    // actions
    fetchChats,
    fetchHistory,
    handleInputChange,
    send,
    edit,
    remove,
  };
}