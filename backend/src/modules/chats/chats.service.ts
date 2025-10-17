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
import { ChatGateway } from './chat.gateway';

/**
 * ChatsService
 * - Handles chat lifecycle and messages.
 * - Uses transactions where multiple tables must change together (create chat + first message + statuses).
 */

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway
  ) {}

  /**
   * Send all chats with other users, find all the current chatId that contains userId and
   * return those chatId with recipient id to the backend
   */
  async getChats(getChatsDetails: getChatsDetails): Promise<getChatsResults> {
    const client: any = this.prisma as any;
    const { userId } = getChatsDetails;

    Logger.log("user id:", userId);

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
      Logger.error('getChats error', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to find chats');
    }
  }

  /**
   * Send a message. If chatId not provided, find or create the chat between sender and recipient.
   * This uses a transaction when creating a chat + message + statuses so the operations are atomic.
   * Now supports optional image attachments via imageId.
   */
  async sendMessage(sendMessageDetails: sendMessageDetails): Promise<sendMessageResults> {
    const client: any = this.prisma as any;
    const { chatId, senderId, recipientId, content, imageUrl, imageKey } = sendMessageDetails;

    try {
      // Validate: message must have either content or imageId
      if (!content && !imageUrl) {
        throw new BadRequestException('Message must have either content or image');
      }

      if (!chatId) {
        // First time sending message -> create chat
        const [userAId, userBId] = [senderId, recipientId].sort(); // Sort for unique constraint
        const txResult = await client.$transaction(async (tx: any) => {
          // Create chat
          const chat = await tx.chat.create({
            data: {
              userAId,
              userBId,
              latestMessageAt: new Date(),
            },
          });

          const image = (imageUrl && imageUrl) 
            ? await tx.image.create({
                data: {
                  url: imageUrl,
                  key: imageKey,
                  userId: senderId,
                }
              }) 
            : null;

          // Create message with optional image
          const message = await tx.message.create({
            data: {
              chatId: chat.id,
              senderId,
              content: content || null, // Allow null for image-only messages
              imageId: image?.id
            },
          });

          return { chat, message: {
            ...message,
            imageUrl: image?.url
          }};
        });

        // Emit new message event through WebSocket
        this.chatGateway.emitNewMessage(txResult.chat.id, senderId, txResult.message);

        return {
          message: txResult.message as MessageDetails,
          chatCreated: true,
          chat: txResult.chat as ChatDetails,
        }
      }

      // Not the first message -> update existing chat
      const txResult = await client.$transaction(async (tx: any) => {
        const chat = await tx.chat.findUnique({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        //TODO: Have to create the image object first
        const image = (imageUrl && imageUrl) 
          ? await tx.image.create({
              data: {
                url: imageUrl,
                key: imageKey,
                userId: senderId,
              }
            }) 
          : null;

        // Create message with optional image
        const message = await tx.message.create({
          data: {
            chatId,
            senderId,
            content: content || null, // Allow null for image-only messages
            imageId: image?.id
          },
        });

        // Update the latestMessage timestamp in chat
        await tx.chat.update({
          where: { id: chatId },
          data: { latestMessageAt: new Date() } 
        });

        return { chat, message: {
          ...message,
          imageUrl: image?.url
        }};
      });

      // Emit new message event through WebSocket
      this.chatGateway.emitNewMessage(txResult.chat.id, senderId, txResult.message);

      return {
        message: txResult.message as MessageDetails,
        chatCreated: false,
      };
    } catch (error) {
      Logger.error(error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      if (error && error.code === 'P2002') throw new ConflictException('Unique constraint violation');
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  /**
   * Get chat history for a chatId
   * Includes image data when messages have image attachments
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

      // Fetch messages with image data
      const rawMessages = await client.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' }, // Chronological order
        select: {
          id: true,
          chatId: true,
          content: true,
          senderId: true,
          imageId: true, // Include image ID
          createdAt: true,
          updatedAt: true,
          isEdited: true,
          isDeleted: true,
          statuses: { // Join with UserMessageStatus for per-user delete status
            where: { userId },
            select: { isDeleted: true },
          },

          //TODO: please update this query here to correctly fetch image
          image: {
            select: {
              url: true, // Get the image URL
            },
          },
        },
      });

      // Transform messages to include isDeletedForYou status
      const messages = rawMessages.map((m: any) => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        content: m.content,
        imageUrl: m.image?.url ?? null, //! warning if bad thing happen
        isEdited: m.isEdited,
        isDeleted: m.isDeleted,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        isDeletedForYou: (m.statuses && m.statuses[0]?.isDeleted) ?? false, // Default to false if no status
      })) as MessageWithStatusDetails[];

      return {
        messages: messages as MessageWithStatusDetails[]
      };
    } catch (error) {
      Logger.error(error)
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

      //* No need to handle editing image => a bit complex
      // update the message
      const updatedMessage = await client.message.update({
        where: { id: messageId },
        data: {
          content: content,
          isEdited: true,
        },
      });

      // Find the chat and emit message edit event
      const chat = await client.chat.findFirst({
        where: {
          messages: {
            some: { id: messageId }
          }
        }
      });

      if (chat) {
        this.chatGateway.emitMessageEdit(chat.id, userId, messageId, content);
      }

    } catch (error) {
      Logger.error(error)
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
      
      if (forEveryone === 'true') { // Delete for everyone
        // check authorization
        if (message.senderId != userId) {
          throw new BadRequestException('You can only delete your own messages for everyone');
        }

        //TODO: may need to update functionality to add soft delete for image
        // soft delete on Message table
        await client.message.update({
          where: { id: messageId },
          data: { isDeleted: true },
        });

        // Find the chat and emit message delete event
        const chat = await client.chat.findFirst({
          where: {
            messages: {
              some: { id: messageId }
            }
          }
        });

        if (chat) {
          this.chatGateway.emitMessageDelete(chat.id, userId, messageId);
        }
      } else { // Delete for you

        //TODO: may need to update functionality to add soft delete for image
        // here we create a new entry in the userMessageStatus table
        await client.userMessageStatus.create({
          data: {
            userId: userId,
            messageId: messageId,
            isDeleted: true
          }
        })
      }
    } catch (error) {
      Logger.error(error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to delete message');
    }
  }
}
