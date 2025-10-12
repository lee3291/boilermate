import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { 
  ChatDetails, 
  deleteMessageDetails, 
  editMessageDetails, 
  getChatsDetails, 
  getChatsResults, 
  getMessagesDetails, 
  getMessagesResults, 
  MessageDetails, 
  MessageWithStatusDetails, 
  sendMessageDetails, 
  sendMessageResults,
} from './interfaces';
import { PrismaService } from '@core/database/prisma.service';

/**
 * ChatsService
 * - Handles chat lifecycle and messages.
 * - Uses transactions where multiple tables must change together (create chat + first message + statuses).
 */

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send all chats with other users, find all the current chatId that contains userId and
   * return those chatId with recipient id to the backend
   */
  async getChats(getChatsDetails: getChatsDetails): Promise<getChatsResults> {
    const client: any = this.prisma as any;
    const { userId } = getChatsDetails;

    try {
      // test if user exists
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const chats = await client.chat.findMany({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
        orderBy: { latestMessageAt: 'desc'}
      });

      return {
        chats: chats as ChatDetails[]
      }

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to find chats');
    }
  }

  /**
   * Send a message. If chatId not provided, find or create the chat between sender and recipient.
   * This uses a transaction when creating a chat + message + statuses so the operations are atomic.
   */
  async sendMessage(sendMessageDetails: sendMessageDetails): Promise<sendMessageResults> {
    const client: any = this.prisma as any;
    const { chatId, senderId, recipientId, content } = sendMessageDetails;

    try {
      if (!chatId) {
        // first time sending text
        const [userAId, userBId] = [senderId, recipientId].sort();
        const txResult = await client.$transaction(async (tx: any) => {
          // create chat
          const chat = await tx.chat.create({
            data: {
              userAId,
              userBId,
              latestMessageAt: new Date(),
            },
          });

          // create message
          const message = await tx.message.create({
            data: {
              chatId: chat.id,
              senderId,
              content,
            },
          });

          return { chat, message };
        });

        return {
          message: txResult.message as MessageDetails,
          chatCreated: true,
          chat: txResult.chat as ChatDetails,
        }
      }

      // not the first message sent -> no need to create chat -> only have to update latestMessage
      const txResult = await client.$transaction(async (tx: any) => {
        const chat = await tx.chat.findUnique({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        // create message
        const message = await tx.message.create({
          data: {
            chatId,
            senderId,
            content,
          },
        });

        // update the latestMessage in chat
        await tx.chat.update({
          where: { id: chatId },
          data: { latestMessageAt: new Date() } 
        });

        return { message };
      });

      return {
        message: txResult.message as MessageDetails,
        chatCreated: false,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      if (error && error.code === 'P2002') throw new ConflictException('Unique constraint violation');
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  /**
   * Get chat history for a chatId
   */
  async getHistory(chatId: string, getMessagesDetails: getMessagesDetails): Promise<getMessagesResults>{
    const client: any = this.prisma as any;
    const { userId } = getMessagesDetails;

    try {
      const chat = await client.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      const rawMessages = await client.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          chatId: true,
          content: true,
          senderId: true,
          createdAt: true,
          updatedAt: true,
          isEdited: true,
          isDeleted: true,
          statuses: { // this is like a join operations so already joined with messageId => only need userId
            where: { userId },
            select: { isDeleted: true },
          },
        },
      });

      // need to updated to have isDeletedForYou in right format
      const messages = rawMessages.map((m: any) => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        content: m.content,
        isEdited: m.isEdited,
        isDeleted: m.isDeleted,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        isDeletedForYou: (m.statuses && m.statuses[0]?.isDeleted) ?? false,
      })) as MessageWithStatusDetails[];

      // Return the two separate arrays as requested by the interface.
      return {
        messages: messages as MessageWithStatusDetails[]
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve chat history');
    }
  }

  /**
   * Edit message: only change content and mark isEdited.
   * Only the sender should be allowed to call this in controller layer.
   */
  async editMessage(messageId: string, editMessageDetails: editMessageDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { content, userId } = editMessageDetails;

    try {
      // find message
      const message = await client.message.findUnique({
        where: { id: messageId },
      });

      // check if message exists
      if (!message) {
        throw new NotFoundException('Message not found');
      }

      // check authorization
      if (message.senderId !== userId) {
        throw new BadRequestException('You are not authorized to edit this message');
      }

      // update the message
      await client.message.update({
        where: { id: messageId },
        data: {
          content: content,
          isEdited: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to edit message');
    }
  }

  /**
   * Delete message: either mark global deleted (forEveryone) or create/update UserMessageStatus for user hide.
   */
  async deleteMessage(messageId: string, deleteMessageDetails: deleteMessageDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId, forEveryone } = deleteMessageDetails;

    try {
      // check if message exist
      const message = await client.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }
      
      if (forEveryone) { // Delete for everyone
        // check authorization
        if (message.senderId != userId) {
          throw new BadRequestException('You can only delete your own messages for everyone');
        }

        // soft delete on Message table
        await client.message.update({
          where: { id: messageId },
          data: { isDeleted: true },
        });
      } else { // Delete for you
        // here we create a new entry in the userMessageStatus table
        await client.userMessageStatus.create({
          data: {
            userId: userId,
            messageId: messageId
          }
        })
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to delete message');
    }
  }
}
