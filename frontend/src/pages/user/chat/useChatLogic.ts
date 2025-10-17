import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getChats as apiGetChats,
  getHistory as apiGetHistory,
  sendMessage as apiSendMessage,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
} from '@/services/chatService';
import {
  getPresignedUrl as apiGetPresignedUrl,
  uploadFileToS3 as apiUploadFileToS3
} from '@/services/uploadService';
import { compressImage } from '@/utils/imageCompression';
import config from '@/utils/config';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // store the selected image file
  const [isUploadingImage, setIsUploadingImage] = useState(false); // track if image is being uploaded
  const [loadingChats, setLoadingChats] = useState(false); // set loading state when fetching all chatIds in side bar
  const [loadingMessages, setLoadingMessages] = useState(false); // set loading state when fetching all the messages in chat window
  const [error, setError] = useState<string | null>(null); // set error state when handling events

  // fetch all chats for current user
  const fetchChats = useCallback(async (userId?: string) => {
    //console.log('check chat fetching')

    if (!userId) return;
    setLoadingChats(true);
    setError(null);
    try {
      const req: getChatsRequest = { userId };
      const res: getChatsResponse = await apiGetChats(req);

      //console.log('the hell ???')

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

  // handle file selection for image upload
  const handleFileChange = useCallback((file: File | null) => {
    // validate file type - only allow image formats
    if (file && !file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    // validate file size - max 10MB before compression
    if (file && file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }
    setSelectedFile(file); // store the selected file
    setError(null); // clear any previous errors
  }, []);

  // send message (handles both existing chat and first-time if needed)
  const send = useCallback(
    async (overrides?: { recipientId?: string }) => {

      //TODO: Need to modify this to account for sending image
      if (!currentUserId) {
        setError('senderId required');
        return null;
      }

      //console.log('verify function being called')

      // Check if there's content to send (either text or image)
      const hasText = messageInput?.trim();
      const hasImage = selectedFile !== null;

      // prevent sending empty message
      if (!hasText && !hasImage) return null;
      
      setError(null);

      try {
        let imageUrl: string | undefined; // will store the final S3 URL if image is uploaded
        let imageKey: string | undefined;

        // If user selected an image, handle the upload workflow
        if (selectedFile) {
          setIsUploadingImage(true); // show loading state for image upload

          try {
            // Compress the image to reduce file size
            const compressedFile = await compressImage(selectedFile);

            // Request presigned URL from backend
            const { preSignedUrl, key } = await apiGetPresignedUrl({
              contentType: compressedFile.type, // send MIME type to backend
              userId: currentUserId, // send user ID for tracking
            });

            // Upload compressed image directly to S3 using presigned URL
            await apiUploadFileToS3(preSignedUrl, compressedFile);

            // Construct the final S3 URL from key (backend will create Image record)
            imageUrl = `${config.s3BaseUrl}/${key}`;
            imageKey = key;
          } catch (uploadError: any) {
            setError(uploadError?.message ?? 'Failed to upload image');
            setIsUploadingImage(false); // reset upload state
            return null; // abort sending message if image upload fails
          } finally {
            setIsUploadingImage(false); // reset upload state
          }
        }

        // build the request
        const payload: sendMessageRequest = {
          chatId: selectedChatId ?? undefined,
          senderId: currentUserId,
          recipientId: overrides?.recipientId,
          content: hasText ? messageInput.trim() : '', // send empty string if no text (backend handles image-only)
          imageUrl, //include imageUrl if image was uploaded
          imageKey,
        };

        console.log('wtf', payload);

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

        setMessageInput(''); // clear text input after sending
        setSelectedFile(null); // clear selected file after sending
        return res;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to send message');
        return null;
      }
    },
    [currentUserId, messageInput, selectedChatId, selectedFile] // add selectedFile to dependencies
  );

  // edit a message (only updates local state after API call)
  const edit = useCallback(
    //*  need to care about editing an image
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
    selectedFile, // expose selected file for UI display
    isUploadingImage, // expose upload state for UI feedback

    // status
    loadingChats,
    loadingMessages,
    error,

    // actions
    fetchChats,
    fetchHistory,
    handleInputChange,
    handleFileChange, // expose file handler for ImageUploadButton
    send,
    edit,
    remove,
  };
}