import axios from 'axios';
import type { deleteMessageRequest,
  editMessageRequest,
  getChatsRequest,
  getChatsResponse,
  getHistoryRequest,
  getHistoryResponse,
  sendMessageRequest,
  sendMessageResponse,
  messageApprovalRequest,
  messageApprovalResponse
} from '../types/chats';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export async function getChats(request: getChatsRequest): Promise<getChatsResponse> {
  try {
    console.log('see if getChats being called')
    const res = await api.get('/chats', { params: request });
    console.log("aaa", res)

    return res.data
  } catch (error: any) {
    console.log(error)
    throw error.response?.data ?? error;
  }
}

export async function sendMessage(request: sendMessageRequest): Promise<sendMessageResponse> {
  try {
    const res = await api.post('/chats/messages', request);
    console.log('send message', res)

    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

export async function getHistory(chatId: string, request: getHistoryRequest): Promise<getHistoryResponse> {
  try {
    const res = await api.get(`/chats/${encodeURIComponent(chatId)}/messages`, {
      params: request,
    });
    console.log('history', res)

    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

export async function editMessage(messageId: string, request: editMessageRequest): Promise<void> {
  try {
    const res = await api.put(`/chats/messages/${encodeURIComponent(messageId)}`, request);
    console.log('edit message', res)

  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

export async function deleteMessage(messageId: string, request: deleteMessageRequest): Promise<void> {
  try {
    const res = await api.delete(`/chats/messages/${encodeURIComponent(messageId)}`, {
      params: request
    });
    console.log('delete message', res)

  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Create a new 1-on-1 chat
export async function createNormalChat(request: {
  creatorId: string;
  name: string;
  groupIcon?: string;
  participantIds: string[];
}): Promise<any> {
  try {
    const res = await api.post('/chats/normal-chat', request);
    console.log('create chat', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Search users for creating a new 1-1 chat
// Returns a list of users matching the search query
export async function searchUsersForNormalChatCreation(creatorId: string, searchQuery: string): Promise<{ users: Array<{ id: string; email: string }> }> {
  try {
    const res = await api.get('/chats/users/search-normal-chat', {
      params: { creatorId, q: searchQuery },
    });
    console.log('search users for normal chat creation', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

//Approve msgs
export async function approveMessage(messageId: string, request: { userId: string }): Promise<any> {
  try {
    const res = await api.post(
        `/chats/messages/${encodeURIComponent(messageId)}/approve`,
        request
    );
    console.log('approve message', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Approve message status
export async function approveMessageStatus(messageId: string, request: { userId: string }): Promise<boolean> {
  try {
    const res = await api.get(
        `/chats/messages/${encodeURIComponent(messageId)}/approve-status`,
        {
          params: { userId: request.userId } // send userId as query param
        }
    );
    console.log('approve message status', res.data);
    return res.data; // should be true/false from backend
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Get list of userIds blocked by user
export async function getBlockedByUserId(userId: string): Promise<{ users: Array<{ id: string; email: string }> }> {
  try {
    const res = await api.get(`/chats/${userId}/blocked`);
    console.log('list of users blocked by userId', res.data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Get list of userIds who blocked user
export async function getUsersWhoBlockedMeIds(userId: string): Promise<string[]> {
  try {
    const res = await api.get(`/chats/${userId}/blocked-by`);
    console.log('list of userIds who blocked user', res.data);
    return res.data.userIds;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Get list of userIds user can still block
// Get list of userIds user can still block (with optional search query)
export async function getUserIdsCanBlock(userId: string, searchQuery?: string): Promise<{ users: Array<{ id: string; email: string }> }> {
  try {
    const res = await api.get(`/chats/${userId}/can-block`, {
      params: { q: searchQuery },
    });
    console.log('list of users user can still block', res.data);
    return res.data; // expected format: { users: [{ id, email }, ...] }
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Block a user
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  try {
    await api.post(`/chats/${blockerId}/blocked`, { blockerId, blockedId });
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Unblock a user
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  try {
    await api.delete(`/chats/${blockerId}/unblock`, { data: { blockerId, blockedId } });
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}
export default { getChats, sendMessage, getHistory, editMessage,
  deleteMessage, createNormalChat, searchUsersForNormalChatCreation,
  getBlockedByUserId, getUsersWhoBlockedMeIds, getUserIdsCanBlock,
  blockUser, unblockUser};