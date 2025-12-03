import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getChats as apiGetChats,
  getHistory as apiGetHistory,
  sendMessage as apiSendMessage,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
  createNormalChat as apiCreateNormalChat,
  searchUsersForNormalChatCreation as apiSearchUsersForNormalChatCreation,
  getUserIdsCanBlock as apiSearchUsersForBlock,
  blockUser as apiBlockUser,
  unblockUser as apiUnblockUser,
  getBlockedByUserId as apiBlockedByUserId,
  isBlockedBetween as apiIsBlockBetween,
  addReaction as apiAddReaction,
  removeReaction as apiRemoveReaction,
  getReactions as apiGetReactions,
  getReactionCount as apiGetReactionCount,
  pinMessage as apiPinMessage,
  unpinMessage as apiUnpinMessage,
  getPinnedMessages as apiGetPinnedMessages,
} from '@/services/chatService';
import {
  getPresignedUrl as apiGetPresignedUrl,
  uploadFileToS3 as apiUploadFileToS3
} from '@/services/uploadService';
import {
  getInvitations as apiGetInvitations,
  acceptInvitation as apiAcceptInvitation,
  declineInvitation as apiDeclineInvitation,
  createGroupChat as apiCreateGroupChat,
  inviteParticipant as apiInviteParticipant,
  removeParticipant as apiRemoveParticipant,
  leaveGroupChat as apiLeaveGroupChat,
  searchUsersForGroupCreation as apiSearchUsersForGroupCreation,
  searchUsersForAddingToGroup as apiSearchUsersForAddingToGroup,
  createPoll as apiCreatePoll,
  getAllPolls as apiGetAllPolls,
  addPollOption as apiAddPollOption,
    submitVotes as apiSubmitVotes,
} from '@/services/groupChatService';
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

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}


interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}
export default function useChatLogic(user: User) {
  const userId = user.id;
  const [conversations, setConversations] = useState<Chat[]>([]); // populate the chat sidebar
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null); // enable clicking for the chat sidebar, save state
  const [messages, setMessages] = useState<MessageWithStatus[]>([]); // set the message display part in the chat window
  const [messageInput, setMessageInput] = useState<string>(''); // set the message in the input bar
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // store the selected image file
  const [isUploadingImage, setIsUploadingImage] = useState(false); // track if image is being uploaded
  const [loadingChats, setLoadingChats] = useState(false); // set loading state when fetching all chatIds in side bar
  const [loadingMessages, setLoadingMessages] = useState(false); // set loading state when fetching all the messages in chat window
  const [polls, setPolls] = useState<Poll[]>([]); //track polls
  const [error, setError] = useState<string | null>(null); // set error state when handling events

  // Group chat specific states
  const [invitations, setInvitations] = useState<any[]>([]); // pending group invitations
  const [invitationsCount, setInvitationsCount] = useState(0); // count of pending invitations
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); // control create group modal visibility
  const [showInvitationsModal, setShowInvitationsModal] = useState(false); // control invitations modal visibility
  const [showAddMembersModal, setShowAddMembersModal] = useState(false); // control add members modal visibility
  const [showGroupMembersSidebar, setShowGroupMembersSidebar] = useState(false); // control group members sidebar visibility

  // 1-1 chat
  const [showCreateNormalChatModal, setShowCreateNormalChatModal] = useState(false); // control create 1-1 modal visibility
  const [showBlockModal, setShowBlockModal] = useState(false); // control block modal visibility
  const [blockedBetween, setBlockedBetween] = useState<boolean>(false);

  // fetch all chats for current user
  const fetchChats = useCallback(async () => {
    if (!userId) return;
    setLoadingChats(true);
    setError(null);
    try {
      const req: getChatsRequest = { userId };
      const res: getChatsResponse = await apiGetChats(req);
      setConversations(res.chats || []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  }, [userId]);

  // fetch history for selected chat and current user
  const fetchHistory = useCallback(
    async (chatId: string) => {
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
    [userId]
  );

  // When userId changes fetch chats and connect to WebSocket to subscribe to current chat
  useEffect(() => {
    if (!userId) return;

    async function initConnection() {
      try {
        // Wait for socket connection before fetching
        await chatSocket.connect(userId);
        await fetchChats();
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError('Connection failed');
      }
    }

    initConnection();

    return () => {
      // this is a clean up function when a user disconnect (log out, ...)
      // will be called when the component unmount itself before using new effect after dependencies changes
      chatSocket.disconnect();
    };
  }, [userId, fetchChats]);

  // When selected chat changes fetch its history and join chat room
  useEffect(() => {
    if (!selectedChatId || !userId) return;

    fetchHistory(selectedChatId);
    chatSocket.joinChat(selectedChatId); // emit signal to backend that user join a new chat

    return () => {
      // this is a function that is used when a component unmount itself
      // before the effect runs again due to dependencies changes
      chatSocket.leaveChat(selectedChatId);
    };
  }, [selectedChatId, userId, fetchHistory]);

  // Set up WebSocket event handlers
  useEffect(() => {
    if (!userId) return;

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
  }, [userId]);

  //refresh chat after recieve new msg
  useEffect(() => {
    if (!userId) return;

    const refreshHandler = ({ chatId }: { chatId: string }) => {
      if (chatId === selectedChatId) {
        fetchHistory(chatId); // fetch latest messages
      }
    };

    const unsubRefresh = chatSocket.onRefreshChat(refreshHandler);

    return () => {
      unsubRefresh();
    };
  }, [userId, selectedChatId, fetchHistory]);

  // Refresh block status when selected chat changes
  useEffect(() => {
    if (!userId || !selectedChatId) return;

    const selectedConversation = conversations.find(c => c.id === selectedChatId);
    if (!selectedConversation || selectedConversation.isGroup) {
      setBlockedBetween(false);
      return;
    }

    const otherUserId = selectedConversation.participants?.find(p => p.id !== userId)?.id;
    if (!otherUserId) {
      setBlockedBetween(false);
      return;
    }

    const fetchBlockStatus = async () => {
      try {
        const res = await apiIsBlockBetween(userId, otherUserId);
        setBlockedBetween(res);
      } catch {
        setBlockedBetween(false);
      }
    };

    // initial fetch
    fetchBlockStatus();

    // subscribe to block events from WebSocket
    const unsubBlock = chatSocket.onBlockStatusChange(({ user1, user2 }) => {
      if ([user1, user2].includes(userId) && [user1, user2].includes(otherUserId)) {
        fetchBlockStatus();
      }
    });

    return () => {
      unsubBlock();
    };
  }, [userId, selectedChatId, conversations]);




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
      if (!userId) {
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
              userId: userId, // send user ID for tracking
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
          senderId: userId,
          recipientId: overrides?.recipientId,
          content: hasText ? messageInput.trim() : '', // send empty string if no text (backend handles image-only)
          imageUrl, //include imageUrl if image was uploaded
          imageKey,
        };

        //console.log('wtf', payload);

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
    [userId, messageInput, selectedChatId, selectedFile] // add selectedFile to dependencies
  );

  // edit a message (only updates local state after API call)
  const edit = useCallback(
    //*  need to care about editing an image
    async (messageId: string, content: string) => {
      if (!userId) {
        setError('userId required');
        return false;
      }

      try {
        const req: editMessageRequest = { content, userId: userId };
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
    [userId]
  );

  // delete a message (forEveryone toggles message.isDeleted, otherwise mark isDeletedForYou)
  const remove = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      if (!userId) {
        setError('userId required');
        return false;
      }

      try {
        const req: deleteMessageRequest = { userId: userId, forEveryone: forEveryone };
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
    [userId]
  );

  const messagesForSelected = useMemo(() => messages, [messages]);

  // Fetch pending invitations for current user
  const fetchInvitations = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await apiGetInvitations({ userId: userId });
      setInvitations(result || []);
      setInvitationsCount(result?.length || 0);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load invitations');
    }
  }, [userId]);

  // Accept an invitation
  const handleAcceptInvitation = useCallback(async (invitationId: string) => {
    if (!userId) return;
    try {
      await apiAcceptInvitation(invitationId, { userId: userId });
      // Refresh invitations and chats
      await fetchInvitations();
      await fetchChats();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to accept invitation');
    }
  }, [userId, fetchInvitations, fetchChats]);

  // Decline an invitation
  const handleDeclineInvitation = useCallback(async (invitationId: string) => {
    if (!userId) return;
    try {
      await apiDeclineInvitation(invitationId, { userId: userId });
      // Refresh invitations
      await fetchInvitations();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to decline invitation');
    }
  }, [userId, fetchInvitations]);

  //Create normal chat
  const handleCreateNormalChat = useCallback(async (recipientId: string) => {
    if (!userId) return;

    try {
      await apiCreateNormalChat({
        creatorId: userId,
        name: userId,
        participantIds: [recipientId],
      });

      await fetchChats();
      setShowCreateNormalChatModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create chat');
    }
  }, [userId, fetchChats]);


  // Create a new group chat
  const handleCreateGroup = useCallback(async (name: string, participantIds: string[], groupIcon?: string) => {
    if (!userId) return;
    try {
      await apiCreateGroupChat({
        creatorId: userId,
        name,
        groupIcon,
        participantIds,
      });
      // Refresh chats
      await fetchChats();
      setShowCreateGroupModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create group');
    }
  }, [userId, fetchChats]);

  //Handle block
  const handleBlock = useCallback(async (targetUserId: string) => {
    if (!userId) return;
    try {
      await apiBlockUser(userId, targetUserId);
      await fetchChats(); // refresh UI if needed
      setShowBlockModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to block user');
    }
  }, [userId, fetchChats]);

  //Handle unblock
  const handleUnblock = useCallback(
      async (targetUserId: string) => {
        if (!userId) return;
        try {
          await apiUnblockUser(userId, targetUserId); // <-- use your unblock API here
          await fetchChats(); // refresh UI if needed
          setShowBlockModal(false);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to unblock user');
        }
      },
      [userId, fetchChats]
  );

  //Search users for block
  const handleSearchUsersForBlock = useCallback(async (searchQuery: string) => {
    if (!userId) return [];
    try {
      const result = await apiSearchUsersForBlock(userId, searchQuery);
      return result.users || []; // expected format: [{ id, email }]
    } catch (err: any) {
      setError(err?.message ?? 'Failed to search users for blocking');
      return [];
    }
  }, [userId]);

  // Get list of blocked users by current userId
  const handleGetBlockedList = useCallback(
      async (): Promise<{ id: string; email?: string }[]> => {
        if (!userId) return [];

        try {
          const blockedIds = await apiBlockedByUserId(userId);
          // Ensure blockedIds is always an array
          const safeBlockedIds = Array.isArray(blockedIds) ? blockedIds : [];
          return safeBlockedIds.map((id) => ({ id }));
        } catch (err: any) {
          setError(err?.message ?? 'Failed to fetch blocked users');
          return [];
      }
      },
      [userId]
  );

  // Search users for 1-1 creation
  const handleSearchUsersForNormalChat = useCallback(async (searchQuery: string) => {
        if (!userId) return [];

        try {
          const result = await apiSearchUsersForNormalChatCreation(userId, searchQuery);
          return result.users || [];
        } catch (err: any) {
          setError(err?.message ?? 'Failed to search users');
          return [];
        }
      },
      [userId]
  );


  // Search users for group creation (mock function for now - you can fill this in)
  const handleSearchUsers = useCallback(async (searchQuery: string) => {
    if (!userId) return [];
    try {
      const result = await apiSearchUsersForGroupCreation(userId, searchQuery);
      return result.users || [];
    } catch (err: any) {
      setError(err?.message ?? 'Failed to search users');
      return [];
    }
  }, [userId]);

  // Search users for adding to group (mock function for now - you can fill this in)
  const handleSearchUsersForGroup = useCallback(async (chatId: string, searchQuery: string) => {
    try {
      const result = await apiSearchUsersForAddingToGroup(chatId, userId, searchQuery);
      return result.users || [];
    } catch (err: any) {
      setError(err?.message ?? 'Failed to search users');
      return [];
    }
  }, [userId]);

  // Create a new poll
  const handleCreatePoll = useCallback(
      async (chatId: string, question: string, options: string[]): Promise<boolean> => {
        if (!userId) {
          setError('userId required');
          return false;
        }

        try {
          const newPoll: Poll = await apiCreatePoll(chatId, question, options );
          setPolls((prev) => [...prev, newPoll]); // append new poll
          return true;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to create poll');
          return false;
        }
      },
      [userId]
  );
  //Get all polls given chat id
  const handleGetPolls = useCallback(
      async (chatId: string, userId: string) => {
        if (!chatId) return [];
        if (!userId) return [];
        try {
          const res = await apiGetAllPolls(chatId, userId); // call backend service
          setPolls(res || []);
          return res;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to fetch polls');
          return [];
        }
      },
      []
  );

  // Add a new option in a specific poll
  const handleAddOption = useCallback(
      async (pollId: string, optionText: string) => {
        if (!pollId || !optionText.trim()) return;

        try {
          const newOption: PollOption = await apiAddPollOption(pollId, optionText.trim());

          setPolls(prevPolls =>
              prevPolls.map(poll => {
                if (poll.id !== pollId) return poll;
                return { ...poll, options: [...poll.options, newOption] };
              })
          );

          return newOption; // return new option to match PollsSidebar's expected type
        } catch (err: any) {
          setError(err?.message ?? 'Failed to add poll option');
          return undefined;
        }
      },
      []
  );

  // Update poll after a user submit
  // Update poll after a user submits votes
  const handleSubmitVotes = useCallback(
      async (pollId: string, options: { id: string; selected: boolean }[]) => {
        if (!pollId || !userId) return false;

        try {
          await apiSubmitVotes(pollId, userId, options);

          // Update local poll state
          setPolls(prevPolls =>
              prevPolls.map(poll => {
                if (poll.id !== pollId) return poll;

                // Update each option's local "votedByUser"
                const updatedOptions = poll.options.map(opt => {
                  const submitted = options.find(o => o.id === opt.id);
                  if (!submitted) return opt;

                  return {
                    ...opt,
                    votedByUser: submitted.selected,
                  };
                });

                return { ...poll, options: updatedOptions };
              })
          );

          return true;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to submit poll votes');
          return false;
        }
      },
      [userId]
  );
  // Pin msg
  const handlePinMessage = useCallback(
      async (chatId: string, messageId: string, userId: string): Promise<boolean> => {
        try {
          const success = await apiPinMessage(chatId, messageId, userId);
          if (success) {
            alert('Pinned message successfully!');
          } else {
            alert('Failed to pin message!');
          }
          return success;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to pin message');
          return false;
        }
      },
      []
  );
  // Unpin msg
  const handleUnpinMessage = useCallback(
      async (chatId: string, messageId: string, userId: string): Promise<boolean> => {
        try {
          const success = await apiUnpinMessage(chatId, messageId, userId);
          if (success) {
            alert('Unpinned message successfully!');
          } else {
            alert('Failed to unpin message!');
          }
          return success;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to unpin message!');
          return false;
        }
      },
      []
  );


  // Add or update a reaction
  const handleAddReaction = useCallback(
      async (messageId: string, userId: string, reaction: string) => {
        if (!userId) return null;
        try {
          return await apiAddReaction(messageId, userId, reaction);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to add reaction');
          return null;
        }
      },
      [userId]
  );

  // Remove a reaction
  const handleRemoveReaction = useCallback(
      async (messageId: string) => {
        if (!userId) return false;
        try {
          await apiRemoveReaction(messageId, userId);
          return true;
        } catch (err: any) {
          setError(err?.message ?? 'Failed to remove reaction');
          return false;
        }
      },
      [userId]
  );

  // Get all reactions for a message
  const handleGetReactions = useCallback(
      async (messageId: string) => {
        try {
          return await apiGetReactions(messageId);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to fetch reactions');
          return [];
        }
      },
      []
  );

  // Get total reaction count for a message
  const handleGetReactionCount = useCallback(
      async (messageId: string) => {
        try {
          return await apiGetReactionCount(messageId);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to fetch reaction count');
          return 0;
        }
      },
      []
  );

  // Get all reactions for a message
  const handleGetPinnedMessages = useCallback(
      async (chatId: string) => {
        try {
          return await apiGetPinnedMessages(chatId);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to fetch pinned messages');
          return [];
        }
      },
      []
  );


  // Add member to group (admin only)
  const handleAddMember = useCallback(async (chatId: string, memberUserId: string) => {
    if (!userId) return;
    try {
      await apiInviteParticipant(chatId, { creatorId: userId, userId: memberUserId });
      // Note: Member will be in PENDING status until they accept
      // Refetch chats to update the participants list in the sidebar
      await fetchChats();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to add member');
    }
  }, [userId, fetchChats]);

  // Remove member from group (admin only)
  const handleRemoveMember = useCallback(async (chatId: string, memberUserId: string) => {
    if (!userId) return;
    try {
      await apiRemoveParticipant(chatId, memberUserId, { creatorId: userId });
      // Refetch chats to update the participants list in the sidebar
      await fetchChats();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to remove member');
    }
  }, [userId, fetchChats]);

  // Delete entire group chat (creator only)
  const handleDeleteGroup = useCallback(async (chatId: string) => {
    if (!userId) return;
    try {
      const { deleteGroupChat } = await import('@/services/groupChatService');
      await deleteGroupChat(chatId, { creatorId: userId });
      // Remove chat from conversations list
      setConversations(prev => prev.filter(c => c.id !== chatId));
      // Clear selected chat if it was deleted
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete group');
      throw err; // Re-throw so UI can handle the error
    }
  }, [userId, selectedChatId]);

  // Leave group chat (any member can leave)
  const handleLeaveGroup = useCallback(async (chatId: string) => {
    if (!userId) return;
    try {
      await apiLeaveGroupChat(chatId, { userId: userId });
      // Remove chat from conversations list
      setConversations(prev => prev.filter(c => c.id !== chatId));
      // Clear selected chat if it was the one we left
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to leave group');
      throw err; // Re-throw so UI can handle the error
    }
  }, [userId, selectedChatId]);

  // Fetch invitations when user changes
  useEffect(() => {
    if (userId) {
      fetchInvitations();
    }
  }, [userId, fetchInvitations]);

  return {
    // state
    user,
    currentUserId: userId,
    conversations,
    selectedChatId,
    setSelectedChatId,
    messages: messagesForSelected,
    messageInput,
    selectedFile, // expose selected file for UI display
    isUploadingImage, // expose upload state for UI feedback

    // group chat state
    invitations,
    invitationsCount,
    showCreateGroupModal,
    setShowCreateGroupModal,
    showInvitationsModal,
    setShowInvitationsModal,
    showAddMembersModal,
    setShowAddMembersModal,
    showGroupMembersSidebar,
    setShowGroupMembersSidebar,

    // normal chat state
    showCreateNormalChatModal,
    setShowCreateNormalChatModal,

    // block modal state
    showBlockModal,
    setShowBlockModal,

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
    blockedBetween,
    setBlockedBetween,

    //Polls
    handleCreatePoll,
    handleGetPolls,
    handleAddOption,
    handleSubmitVotes,

    // Pin/Unpin
    handlePinMessage,
    handleUnpinMessage,
    handleGetPinnedMessages,

    //Emojis
    handleAddReaction,
    handleRemoveReaction,
    handleGetReactions,
    handleGetReactionCount,

    // group chat actions
    fetchInvitations,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleCreateGroup,
    handleSearchUsers,
    handleSearchUsersForGroup,
    handleAddMember,
    handleRemoveMember,
    handleLeaveGroup,
    handleDeleteGroup,

    // 1-1 chat
    handleCreateNormalChat,
    handleSearchUsersForNormalChat,

    // block/unblock
    handleBlock,
    handleSearchUsersForBlock,
    handleGetBlockedList,
    handleUnblock
  };
}