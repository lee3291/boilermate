import { io, Socket } from 'socket.io-client';
import type { MessageWithStatus } from '@/types/chats';

export class ChatSocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  //* These handlers are the same as like a mailing list, they keep track of all the components that need to receive updates
  private messageHandlers: ((message: MessageWithStatus) => void)[] = [];
  private editHandlers: ((data: { messageId: string; content: string }) => void)[] = [];
  private deleteHandlers: ((data: { messageId: string }) => void)[] = [];
  private refreshHandlers: ((data: { chatId: string }) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.socket = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket'],
    });

    //* on here means the frontend socket is listening for signals from the backend socket

    this.socket.on('onMessage', (message: MessageWithStatus) => {
      console.log("lets go", message)
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('onMessageEdit', (data: { messageId: string; content: string }) => {
      this.editHandlers.forEach(handler => handler(data));
    });

    this.socket.on('onMessageDelete', (data: { messageId: string }) => {
      this.deleteHandlers.forEach(handler => handler(data));
    });
    this.socket.on('refreshChat', (data: { chatId: string }) => {
      this.refreshHandlers.forEach(handler => handler(data));
    });
  }

  connect(userId: string): Promise<void> {
    // if (!this.socket) return;
    // this.socket.auth = { userId };
    // this.socket.connect();
    // console.log('correctly connect to backend socket')
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    return new Promise((resolve, reject) => {
      // Set up one-time connect listener
      this.socket!.once('connect', () => {
        console.log('Socket connected with ID:', this.socket?.id);
        this.connected = true;
        resolve();
      });

      // Set up one-time error listener
      this.socket!.once('connect_error', (error) => {
        console.error('Socket connection failed:', error);
        reject(error);
      });

      // Attempt connection
      this.socket!.auth = { userId };
      this.socket!.connect();
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.connected = false;
    console.log('correctly disconnect from backend socket')
  }

  joinChat(chatId: string) {
    if (!this.socket) return;
    this.socket.emit('joinChat', chatId);
    console.log('correctly send a joinChat signal to backend socket') 
  }

  leaveChat(chatId: string) {
    if (!this.socket) return;
    this.socket.emit('leaveChat', chatId);
    console.log('correctly send a leaveChat signal to backend socket')
  }

  //* This basically mean subscribing the component to receive update
  /**
   * @param handler 
   * handler here is just a simple callback function which is a function that is PASSED AS AN ARGUMENT to another function
   * it is mainly used for ASYNCHRONOUS OPERATIONS like reading file, network request, interacting with the databases
   */
  onMessage(handler: (message: MessageWithStatus) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onMessageEdit(handler: (data: { messageId: string; content: string }) => void) {
    this.editHandlers.push(handler);
    return () => {
      this.editHandlers = this.editHandlers.filter(h => h !== handler);
    };
  }

  onMessageDelete(handler: (data: { messageId: string }) => void) {
    this.deleteHandlers.push(handler);
    return () => {
      this.deleteHandlers = this.deleteHandlers.filter(h => h !== handler);
    };
  }

  onRefreshChat(handler: (data: { chatId: string }) => void) {
    this.refreshHandlers.push(handler);
    return () => {
      this.refreshHandlers = this.refreshHandlers.filter(h => h !== handler);
    };
  }
}

// Create a singleton instance
export const chatSocket = new ChatSocketService();