import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Create a new group chat
export async function createGroupChat(request: {
  creatorId: string;
  name: string;
  groupIcon?: string;
  participantIds: string[];
}): Promise<any> {
  try {
    const res = await api.post('/chats/groups', request);
    console.log('create group chat', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Get all pending invitations for the user
export async function getInvitations(request: {
  userId: string;
}): Promise<any> {
  try {
    const res = await api.get('/chats/invitations', { params: request });
    console.log('get invitations', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Accept a pending invitation
export async function acceptInvitation(invitationId: string, request: {
  userId: string;
}): Promise<void> {
  try {
    const res = await api.post(`/chats/invitations/${encodeURIComponent(invitationId)}/accept`, request);
    console.log('accept invitation', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Decline a pending invitation
export async function declineInvitation(invitationId: string, request: {
  userId: string;
}): Promise<void> {
  try {
    const res = await api.post(`/chats/invitations/${encodeURIComponent(invitationId)}/decline`, request);
    console.log('decline invitation', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Invite a new participant to an existing group (admin only)
export async function inviteParticipant(chatId: string, request: {
  creatorId: string;
  userId: string;
}): Promise<void> {
  try {
    const res = await api.post(`/chats/${encodeURIComponent(chatId)}/participants`, request);
    console.log('invite participant', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Remove a participant from a group (admin only)
export async function removeParticipant(chatId: string, userId: string, request: {
  creatorId: string;
}): Promise<void> {
  try {
    const res = await api.delete(`/chats/${encodeURIComponent(chatId)}/participants/${encodeURIComponent(userId)}`, {
      data: request
    });
    console.log('remove participant', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Leave a group chat (any member can leave)
export async function leaveGroupChat(chatId: string, request: {
  userId: string;
}): Promise<void> {
  try {
    const res = await api.post(`/chats/${encodeURIComponent(chatId)}/leave`, request);
    console.log('leave group chat', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Delete the entire group chat (creator only)
export async function deleteGroupChat(chatId: string, request: {
  creatorId: string;
}): Promise<void> {
  try {
    const res = await api.delete(`/chats/${encodeURIComponent(chatId)}`, {
      data: request
    });
    console.log('delete group chat', res);
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Search users for creating a new group chat
// Returns a list of users matching the search query
export async function searchUsersForGroupCreation(creatorId: string, searchQuery: string): Promise<{
  users: Array<{ id: string; email: string }>;
}> {
  try {
    const res = await api.get('/chats/users/search', { 
      params: { creatorId, q: searchQuery }
    });
    console.log('search users for group creation', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

// Search users to add to an existing group chat
// Excludes users already in the group
// Returns a list of available users matching the search query
export async function searchUsersForAddingToGroup(chatId: string, creatorId: string, searchQuery: string): Promise<{
  users: Array<{ id: string; email: string }>;
}> {
  try {
    const res = await api.get(`/chats/${encodeURIComponent(chatId)}/users/search`, { 
      params: { creatorId, q: searchQuery }
    });
    console.log('search users for adding to group', res);
    return res.data;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
}

export default {
  createGroupChat,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  inviteParticipant,
  removeParticipant,
  leaveGroupChat,
  deleteGroupChat,
  searchUsersForGroupCreation,
  searchUsersForAddingToGroup,
};