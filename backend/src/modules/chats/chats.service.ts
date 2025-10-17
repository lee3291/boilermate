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
   * Get all chats for a user (both DM and group chats)
   * Now uses ChatParticipant model to find all chats where user is a participant
   */
  async getChats(getChatsDetails: getChatsDetails): Promise<getChatsResults> {
    const client: any = this.prisma as any;
    const { userId } = getChatsDetails;

    //! NULL CHECK: Validate userId is provided
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      //! NULL CHECK: Verify user exists before proceeding
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // OLD CODE - Using userAId and userBId (DM only)
      // const chats = await client.chat.findMany({
      //   where: {
      //     OR: [{ userAId: userId }, { userBId: userId }],
      //   },
      //   orderBy: { latestMessageAt: 'desc'}
      // });

      // NEW CODE - Using ChatParticipant to support both DM and group chats
      // Find all chats where user is a participant with ACCEPTED status
      const chats = await client.chat.findMany({
        where: {
          participants: {
            some: {
              userId: userId,
              status: 'ACCEPTED', // Only show chats user has accepted
            }
          }
        },
        orderBy: { latestMessageAt: 'desc' }
      });

      return {
        chats: chats as ChatDetails[] // could be empty array
      }

    } catch (error) {
      Logger.error('getChats error', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to find chats');
    }
  }

  /**
   * * Send a message. If chatId not provided, find or create the chat between sender and recipient.
   * This uses a transaction when creating a chat + message + statuses so the operations are atomic.
   * Now supports optional image attachments via imageId
   */
  async sendMessage(sendMessageDetails: sendMessageDetails): Promise<sendMessageResults> {
    const client: any = this.prisma as any;
    const { chatId, senderId, recipientId, content, imageUrl, imageKey } = sendMessageDetails;

    try {
      //! NULL CHECK: Validate message has either content or image
      if (!content && !imageUrl) {
        throw new BadRequestException('Message must have either content or image');
      }

      //! NULL CHECK: Validate senderId is provided
      if (!senderId) {
        throw new BadRequestException('senderId is required');
      }

      if (!chatId) {
        // First time sending message -> create DM chat with participants
        // this bypass group chat as group chat require you to already have chat id
        
        //! NULL CHECK: recipientId is required for creating new chat
        if (!recipientId) {
          throw new BadRequestException('recipientId is required when creating new chat');
        }

        // OLD CODE - Create chat with userAId and userBId
        // const [userAId, userBId] = [senderId, recipientId].sort(); // Sort for unique constraint
        // const txResult = await client.$transaction(async (tx: any) => {
        //   const chat = await tx.chat.create({
        //     data: {
        //       userAId,
        //       userBId,
        //       latestMessageAt: new Date(),
        //     },
        //   });

        // NEW CODE - Create chat with ChatParticipant entries
        const txResult = await client.$transaction(async (tx: any) => {
          // Create the DM chat (isGroup = false, no name/icon/creator)
          const chat = await tx.chat.create({
            data: {
              isGroup: false,
              latestMessageAt: new Date(),
            },
          });

          // Add sender as ACCEPTED participant
          await tx.chatParticipant.create({
            data: {
              chatId: chat.id,
              userId: senderId,
              status: 'ACCEPTED',
            },
          });

          // Add recipient as ACCEPTED participant (for DM, both auto-accept)
          await tx.chatParticipant.create({
            data: {
              chatId: chat.id,
              userId: recipientId,
              status: 'ACCEPTED',
            },
          });

          //! NULL CHECK: imageUrl and imageKey might be undefined
          const image = (imageUrl && imageKey) 
            ? await tx.image.create({
                data: {
                  url: imageUrl,
                  key: imageKey,
                  userId: senderId,
                }
              }) 
            : null;

          //! NULL CHECK: content might be null for image-only, imageId might be undefined
          // Create message with optional image
          const message = await tx.message.create({
            data: {
              chatId: chat.id,
              senderId,
              content: content || null, // Allow null for image-only messages
              imageId: image?.id || null //! NULL CHECK: use optional chaining and fallback to null
              //* technically this is unnecessary as image?.id evaluate to undefined if image is null
              //* => prisma treat as if it doesn't exist => fallback to NULL anyway => this is just for better clarity
            },
          });

          //! NULL CHECK: image?.url might be undefined, handle gracefully
          return { chat, message: {
            ...message,
            imageUrl: image?.url || null // Use optional chaining with fallback
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
        //! NULL CHECK: chatId might not exist in database
        const chat = await tx.chat.findUnique({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        //! NULL CHECK: imageUrl and imageKey might be undefined
        const image = (imageUrl && imageKey) 
          ? await tx.image.create({
              data: {
                url: imageUrl,
                key: imageKey,
                userId: senderId,
              }
            }) 
          : null;

        //! NULL CHECK: content might be null for image-only, imageId might be undefined
        // Create message with optional image
        const message = await tx.message.create({
          data: {
            chatId,
            senderId,
            content: content || null, // Allow null for image-only messages
            imageId: image?.id || null // NULL CHECK: use optional chaining and fallback to null
          },
        });

        // Update the latestMessage timestamp in chat
        await tx.chat.update({
          where: { id: chatId },
          data: { latestMessageAt: new Date() } 
        });

        // NULL CHECK: image?.url might be undefined, handle gracefully
        return { chat, message: {
          ...message,
          imageUrl: image?.url || null // Use optional chaining with fallback
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
   * Get chat history for a chatId (works for both DM and group chats)
   * Includes image data when messages have image attachments
   */
  async getHistory(chatId: string, getMessagesDetails: getMessagesDetails): Promise<getMessagesResults>{
    const client: any = this.prisma as any;
    const { userId } = getMessagesDetails;

    //! NULL CHECK: Validate required parameters
    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      //! NULL CHECK: Verify chat exists
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
          content: true, // NULL WARNING: can be null for image-only messages
          senderId: true,
          imageId: true, // NULL WARNING: can be null if no image
          createdAt: true,
          updatedAt: true,
          isEdited: true,
          isDeleted: true,
          statuses: { // NULL WARNING: array could be empty
            where: { userId },
            select: { isDeleted: true },
          },
          image: { // NULL WARNING: could be null if no image
            select: {
              url: true, // Get the image URL
            },
          },
        },
      });

      // NULL CHECK: Transform messages to include isDeletedForYou status
      // Handle all potential null/undefined values with proper fallbacks
      const messages = rawMessages.map((m: any) => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        content: m.content || null, // NULL CHECK: content can be null for image-only
        imageUrl: m.image?.url ?? null, // NULL CHECK: handle null image or undefined url
        isEdited: m.isEdited,
        isDeleted: m.isDeleted,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        // NULL CHECK: statuses array might be empty, statuses[0] might not exist
        // Use optional chaining and nullish coalescing for safety
        //* statuses[0] is simply the status of the that user, have to be array for clarity for prisma as a message can have statues from multiple people
        isDeletedForYou: m.statuses?.[0]?.isDeleted ?? false, // Default to false if no status
      })) as MessageWithStatusDetails[];

      return {
        messages: messages as MessageWithStatusDetails[]
      };
    } catch (error) {
      Logger.error(error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
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

    //! NULL CHECK: Validate required parameters
    if (!messageId) {
      throw new BadRequestException('messageId is required');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!content) {
      throw new BadRequestException('content is required');
    }

    try {
      //! NULL CHECK: find message and verify it exists
      const message = await client.message.findUnique({
        where: { id: messageId },
      });

      //! NULL CHECK: check if message exists
      if (!message) {
        throw new NotFoundException('Message not found');
      }

      //! NULL CHECK: verify senderId exists on message (should always exist per schema)
      if (!message.senderId) {
        throw new InternalServerErrorException('Message has no sender');
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

      // NULL CHECK: Find the chat - could be null if chat was deleted
      const chat = await client.chat.findFirst({
        where: {
          messages: {
            some: { id: messageId }
          }
        }
      });

      //! NULL CHECK: Only emit event if chat still exists
      if (chat) {
        this.chatGateway.emitMessageEdit(chat.id, userId, messageId, content);
      } else {
        Logger.warn(`Chat not found for message ${messageId} when trying to emit edit event`);
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

    // NULL CHECK: Validate required parameters
    if (!messageId) {
      throw new BadRequestException('messageId is required');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    //! NULL CHECK: forEveryone should be 'true' or 'false' string
    if (forEveryone !== 'true' && forEveryone !== 'false') {
      throw new BadRequestException('forEveryone must be "true" or "false"');
    }

    try {
      //! NULL CHECK: check if message exists
      const message = await client.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      //! NULL CHECK: verify senderId exists on message (should always exist per schema)
      if (!message.senderId) {
        throw new InternalServerErrorException('Message has no sender');
      }
      
      if (forEveryone === 'true') { // Delete for everyone
        // check authorization - only sender can delete for everyone
        if (message.senderId !== userId) {
          throw new BadRequestException('You can only delete your own messages for everyone');
        }

        //TODO: may need to update functionality to add soft delete for image => no need as now treating image as message
        // soft delete on Message table
        await client.message.update({
          where: { id: messageId },
          data: { isDeleted: true },
        });

        //! NULL CHECK: Find the chat - could be null if chat was deleted
        const chat = await client.chat.findFirst({
          where: {
            messages: {
              some: { id: messageId }
            }
          }
        });

        //! NULL CHECK: Only emit event if chat still exists
        if (chat) {
          this.chatGateway.emitMessageDelete(chat.id, userId, messageId);
        } else {
          Logger.warn(`Chat not found for message ${messageId} when trying to emit delete event`);
        }
      } else { // Delete for you (forEveryone === 'false')

        //TODO: may need to update functionality to add soft delete for image => already handled
        // NULL CHECK: Create entry in userMessageStatus table
        // This creates a new record or throws if duplicate (unique constraint on userId+messageId)
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
      // NULL CHECK: Handle unique constraint violation if user tries to delete same message twice
      if (error && error.code === 'P2002') {
        throw new ConflictException('Message already deleted for this user');
      }
      throw new InternalServerErrorException('Failed to delete message');
    }
  }
}
