import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { 
  ChatDetails, 
  deleteMessageDetails, 
  editMessageDetails, 
  getMessagesDetails, 
  getMessagesResults, 
  MessageDetails, 
  MessageWithStatusDetails, 
  sendMessageDetails, 
  sendMessageResults,
} from './interfaces/chat.interface';
import { PrismaService } from '@core/database/prisma.service';

/**
 * ChatsService
 * - Handles chat lifecycle and messages.
 * - Uses transactions where multiple tables must change together (create chat + first message + statuses).
 */

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

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
        Logger.log("no chat id");

        const [userAId, userBId] = [senderId, recipientId].sort();
        const txResult = await client.$transaction(async (tx: any) => {
          // create chat
          Logger.log("here 1");

          Logger.log("user 1", userAId)
          Logger.log("user 2", userBId)


          const chat = await tx.chat.create({
            data: {
              userAId,
              userBId,
              latestMessageAt: new Date(),
            },
          });

          Logger.log("here 2");


          // create message
          const message = await tx.message.create({
            data: {
              chatId: chat.id,
              senderId,
              content,
            },
          });

          Logger.log("here 3");
          return { chat, message };
        });

        return {
          message: txResult.message as MessageDetails,
          chatCreated: true,
          chat: txResult.chat as ChatDetails,
        }
      }

      Logger.log("have chat id");

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

      // Use Promise.all to run both queries concurrently for efficiency.
      const messagesWithStatus = await client.message.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          // Select all standard Message fields
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          isEdited: true,

          // Select the nested UserMessageStatus relation
          // This is the JOIN operation
          statuses: {
            where: {
              // Filter the statuses relation to only include the record for the current user
              userId: userId,
              chatId: chatId
            },
            select: {
              // Select only the status fields we need
              isDeleted: true,
            },
          },
        },
      });

      // Return the two separate arrays as requested by the interface.
      return {
        messages: messagesWithStatus as MessageWithStatusDetails[]
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
