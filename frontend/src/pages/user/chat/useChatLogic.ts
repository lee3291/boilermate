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
import { chatSocket } from '@/services/chatSocket';

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

  // When currentUserId changes fetch chats and connect to WebSocket to subscribe to current chat
  useEffect(() => {
    if (!currentUserId) return;
    //fetchChats(currentUserId);

    async function initConnection() {
      try {
        // Wait for socket connection before fetching
        await chatSocket.connect(currentUserId);
        await fetchChats(currentUserId);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError('Connection failed');
      }
    }
    
    // Connect to WebSocket
    //chatSocket.connect(currentUserId);
    initConnection();

    return () => {
      // this is a clean up function when a user disconnect (log out, ...)
      // will be called when the component unmount itself before using new effect after dependencies changes
      chatSocket.disconnect();
    };
  }, [currentUserId]);

  // When selected chat changes fetch its history and join chat room
  useEffect(() => {
    if (!selectedChatId || !currentUserId) return;
    
    fetchHistory(selectedChatId, currentUserId);
    chatSocket.joinChat(selectedChatId); // emit signal to backend that user join a new chat

    return () => {
      // this is a function that is used when a component unmount itself
      // before the effect runs again due to dependencies changes
      chatSocket.leaveChat(selectedChatId);
    };
  }, [selectedChatId, currentUserId, fetchHistory]);

  // Set up WebSocket event handlers
  useEffect(() => {
    if (!currentUserId) return;

    // this handler is used to update the newest message for other users
    const messageHandler = (message: MessageWithStatus) => {
      setMessages(prev => [...prev, message]);
    };

    // this handler is used to find the edited message and update it for other users
    const editHandler = (data: { messageId: string; content: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, isEdited: true }
          : msg
      ));
    };

    // this handler is used to find the deleted message and update it for other users if appropriated
    const deleteHandler = (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId
          ? { ...msg, isDeleted: true }
          : msg
      ));
    };

    // these are used to clean up the handler after using
    const unsubMessage = chatSocket.onMessage(messageHandler);
    const unsubEdit = chatSocket.onMessageEdit(editHandler);
    const unsubDelete = chatSocket.onMessageDelete(deleteHandler);

    return () => {
      // these are clean up function that will be used to clean up the handlers when
      // the userId is changed
      unsubMessage();
      unsubEdit();
      unsubDelete();
    };
  }, [currentUserId]);

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

      console.log('verify function being called')

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
    async (messageId: string, forEveryone: boolean) => {
      if (!currentUserId) {
        setError('userId required');
        return false;
      }
      console.log('wtf', forEveryone)
      
      try {
        const req: deleteMessageRequest = { userId: currentUserId, forEveryone: forEveryone };
        await apiDeleteMessage(messageId, req);
        setMessages((prev) => // all chat history
          prev.map((m) => // start mapping for updated window
            m.id === messageId // find matching id
              ? forEveryone // nested boolean
                ? { ...m, isDeleted: true } // set global delete
                : { ...m, isDeletedForYou: true } // set deleted for you
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