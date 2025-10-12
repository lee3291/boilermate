import axios from 'axios';
import type { deleteMessageRequest, editMessageRequest, getChatsRequest, getChatsResponse, getHistoryRequest, getHistoryResponse, sendMessageRequest, sendMessageResponse } from '../types/chats';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export async function getChats(request: getChatsRequest): Promise<getChatsResponse> {
  try {
    console.log('see if getChats being called')
    const res = await api.get('/chats', { params: request });
    console.log("wtf", res)

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

export default { getChats, sendMessage, getHistory, editMessage, deleteMessage };