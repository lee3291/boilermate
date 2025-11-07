import {
  WebSocketGateway,  // Decorator to create a WebSocket gateway
  WebSocketServer,   // Decorator to inject the WebSocket server instance
  SubscribeMessage,  // Decorator to handle incoming WebSocket events
  OnGatewayConnection, // Interface for connection handling
  OnGatewayDisconnect, // Interface for disconnection handling
  ConnectedSocket, // Decorator to inject the socket instance
  MessageBody, // Decorator to get the message payload
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';  // Socket.IO types
import { MessageWithStatusDetails } from './interfaces';

/**
 * @WebSocketGateway - Creates a WebSocket server
 * cors.origin: '*' allows connections from any origin (change in production)
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Inject the Socket.IO server instance
  @WebSocketServer()
  server: Server;

  /**
   * userSockets keeps track of all socket connections for each user
   * - Key: userId
   * - Value: Set of socket IDs (a user can have multiple tabs/windows open)
   * 
   * Example:
   * {
   *   "user123": Set ["socket1", "socket2"],
   *   "user456": Set ["socket3"]
   * }
   */
  private userSockets: Map<string, Set<string>> = new Map();

  /**
   * Handles new WebSocket connections
   * 1. Gets userId from connection auth data
   * 2. Stores the socket connection
   * 3. Adds the user to their personal room
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      // Get userId from the connection authentication data -> this is completely valid as the frontend actually send the userId to the backend
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Store socket connection in our userSockets map -> first time
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      const userSocketSet = this.userSockets.get(userId);

      if (userSocketSet) {  // Add null check to fix TypeScript error
        userSocketSet.add(socket.id);
      }

      /**
       * Socket.IO "Rooms" are like chat channels or groups.
       * - Each socket can join multiple rooms
       * - Messages can be broadcast to all sockets in a room
       * 
       * We create two types of rooms:
       * 1. User rooms (`user:${userId}`): For direct messages to specific users
       * 2. Chat rooms (`chat:${chatId}`): For chat messages between participants
       */
      socket.join(`user:${userId}`);
      
      Logger.log(`Client connected: ${socket.id} for user: ${userId}`);
    } catch (error) {
      Logger.error('Connection error:', error);
      socket.disconnect();
    }
  }
  /**
   * Handles WebSocket disconnections
   * 1. Removes the socket from user's socket set
   * 2. If user has no more sockets, removes user entry
   * 
   * This keeps our userSockets map clean and prevents memory leaks
   */
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const userId = socket.handshake.auth.userId;
      if (userId) {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
          // Remove this socket from user's set
          userSockets.delete(socket.id);
          // If user has no more active sockets, remove their entry
          if (userSockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      }
      Logger.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      Logger.error('Disconnection error:', error);
    }
  }

  /**
   * Emits a new message event to all sockets in a chat room
   * - chatId: The chat room to send to
   * - message: The message object to broadcast
   * 
   * server.to() targets a specific room
   * emit() sends an event with data to all sockets in that room
   */
  emitNewMessage(chatId: string, senderId: string) {
    // Notify all participants except sender to fetch updated history
    this.server
        .to(`chat:${chatId}`)
        .except(Array.from(this.userSockets.get(senderId) || []))
        .emit('refreshChat', { chatId });
  }


  /**
   * Emits a message edit event to all sockets in a chat room
   * - chatId: The chat room to send to
   * - messageId: ID of edited message
   * - content: New message content
   */
  emitMessageEdit(chatId: string, senderId: string, messageId: string, content: string) {
  this.server
    .to(`chat:${chatId}`)
    .except(Array.from(this.userSockets.get(senderId) || []))
    .emit('onMessageEdit', { messageId, content });
  }

  /**
   * Emits a message deletion event to all sockets in a chat room
   * - chatId: The chat room to send to
   * - messageId: ID of deleted message
   */
  emitMessageDelete(chatId: string, senderId: string, messageId: string) {
  this.server
    .to(`chat:${chatId}`)
    .except(Array.from(this.userSockets.get(senderId) || []))
    .emit('onMessageDelete', { messageId });
  }
  /*
   * Call this when someone blocks/unblocks another user
   */
  notifyBlockChange(chatId: string, user1: string, user2: string) {
    this.server
        .to(`chat:${chatId}`)
        .emit('onBlockStatusChange', { user1, user2 });
  }



  /**
   * Handles requests to join a chat room
   * - Socket.IO rooms let us broadcast messages to specific groups
   * - We prefix room names with 'chat:' for clarity
   * 
   * @SubscribeMessage decorator handles 'joinChat' events from clients
   */
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatId: string,
  ) {
    socket.join(`chat:${chatId}`);
    Logger.log(`Socket ${socket.id} joined chat:${chatId}`);
  }

  /**
   * Handles requests to leave a chat room
   * - Called when user switches chats or closes the chat
   * - Keeps rooms clean by removing inactive participants
   */
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatId: string,
  ) {
    socket.leave(`chat:${chatId}`);
    console.log(`Socket ${socket.id} left chat:${chatId}`);
  }
}