import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException  } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { DeleteMessageDto } from './dtos/delete-message.dto';
import { ChatDetails, getMessagesDetails, getMessagesResults, MessageDetails, sendMessageDetails, sendMessageResults, UserMessageStatusDetails } from './interfaces/chat.interface';

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

          // create per-user status rows
          const statusSender = await tx.userMessageStatus.create({
            data: {
              userId: senderId,
              messageId: message.id,
              isDeleted: false,
            },
          });

          // determine other participant
          const otherUserId = chat.userAId === senderId ? chat.userBId : chat.userAId;
          const statusRecipient = await tx.userMessageStatus.create({
            data: {
              userId: otherUserId,
              messageId: message.id,
              isDeleted: false,
            },
          });

          return { chat, message, statues: [statusSender, statusRecipient] };
        });

        return {
          message: txResult.message as MessageDetails,
          chatCreated: true,
          chat: txResult.chat as ChatDetails,
          statues: txResult.statues as UserMessageStatusDetails,
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

        // create users message status
        const statusSender = await tx.userMessageStatus.create({
          data: { userId: senderId, messageId: message.id, isDeleted: false },
        });

        // determine other participant
        const otherUserId = chat.userAId === senderId ? chat.userBId : chat.userAId;
        const statusRecipient = await tx.userMessageStatus.create({
          data: { userId: otherUserId, messageId: message.id, isDeleted: false },
        });

        // update the latestMessage in chat
        await tx.chat.update({
          where: { id: chatId },
          data: { latestMessageAt: new Date() } 
        });

        return { message, statuses: [statusSender, statusRecipient] };
      });

      return {
        message: txResult.message as MessageDetails,
        chatCreated: false,
        statues: txResult.statuses as UserMessageStatusDetails,
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
  async getHistory(getMessagesDetails: getMessagesDetails): Promise<getMessagesResults>{
    const client: any = this.prisma as any;
    const 
  }

  /**
   * Edit message: only change content and mark isEdited.
   * Only the sender should be allowed to call this in controller layer.
   */
  async editMessage(messageId: string, senderId: string, dto: EditMessageDto) {
    // ensure sender owns message
    const client: any = this.prisma as any;
    const message = await client.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');
    if (message.senderId !== senderId) throw new Error('Not authorized');

    return client.message.update({ where: { id: messageId }, data: { content: dto.content, isEdited: true } });
  }

  /**
   * Delete message: either mark global deleted (forEveryone) or create/update UserMessageStatus for user hide.
   */
  async deleteMessage(messageId: string, userId: string, dto: DeleteMessageDto) {
    const client: any = this.prisma as any;

    if (dto.forEveryone) {
      // mark message isDeleted for everyone
      return client.message.update({ where: { id: messageId }, data: { isDeleted: true } });
    }

    // mark user-specific deleted status (create or update)
    return client.userMessageStatus.upsert({ where: { userId_messageId: { userId, messageId } }, update: { isDeleted: true }, create: { userId, messageId, isDeleted: true, isRead: true } });
  }
}
