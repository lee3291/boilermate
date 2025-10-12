// ...existing code...
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export interface SendMessagePayload {
  chatId?: string;
  senderId: string;
  recipientId?: string;
  content: string;
}

export interface MessageDetails {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResult {
  message: MessageDetails;
  chatCreated: boolean;
  chat?: any;
  statuses?: any[];
}

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
  try {
    const res = await api.post('/chats/messages', payload);
    return res.data.data;
  } catch (err: any) {
    throw err.response?.data ?? err;
  }
}

export async function getHistory(chatId: string, userId: string) {
  try {
    const res = await api.get(`/chats/${encodeURIComponent(chatId)}/messages`, {
      params: { userId },
    });
    return res.data.data;
  } catch (err: any) {
    throw err.response?.data ?? err;
  }
}

export async function editMessage(messageId: string, payload: { senderId: string; content: string }) {
  try {
    const res = await api.put(`/chats/messages/${encodeURIComponent(messageId)}`, payload);
    return res.data.data ?? true;
  } catch (err: any) {
    throw err.response?.data ?? err;
  }
}

export async function deleteMessage(messageId: string, payload: { senderId: string; forEveryone?: boolean }) {
  try {
    const res = await api.delete(`/chats/messages/${encodeURIComponent(messageId)}`, { data: payload });
    return res.data.data ?? true;
  } catch (err: any) {
    throw err.response?.data ?? err;
  }
}

export default { sendMessage, getHistory, editMessage, deleteMessage };
// ...existing code...