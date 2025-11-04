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
  blockUserDetails,
  unblockUserDetails,
  blockedUserResult,
  searchUnblockedUserResult,
} from './interfaces';
//Assume normal chat is groupchat but isGroup = False
import {
  CreateGroupChatDetails,
  CreateGroupChatResults,
  GetInvitationsDetails,
  GetInvitationsResults,
  AcceptInvitationDetails,
  DeclineInvitationDetails,
  InviteParticipantDetails,
  RemoveParticipantDetails,
  LeaveGroupChatDetails,
  DeleteGroupChatDetails,
  GroupChatDetails,
  InvitationDetails,
} from './interfaces/group-chat.interface';
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
      // Include participants list with user details
      const chats = await client.chat.findMany({
        where: {
          participants: {
            some: {
              userId: userId,
              // Not show chat after DECLINED
              status: {
                in: ['ACCEPTED', 'PENDING']
              } // Only show chats user has accepted or pending
            }
          }
        },
        include: {
          participants: {
            select: {
              userId: true,
              status: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  // TODO: Add username, firstName, lastName when available
                }
              }
            }
          }
        },
        orderBy: { latestMessageAt: 'desc' }
      });

      // Transform the data to flatten participant details
      const transformedChats = chats.map((chat: any) => ({
        id: chat.id,
        isGroup: chat.isGroup,
        name: chat.name,
        groupIcon: chat.groupIcon,
        creatorId: chat.creatorId,
        latestMessageAt: chat.latestMessageAt,
        participants: chat.participants.map((p: any) => ({
          id: p.user.id,
          email: p.user.email,
          status: p.status,
          // TODO: Add username, firstName, lastName when available
        }))
      }));

      return {
        chats: transformedChats as ChatDetails[] // could be empty array
      }

    } catch (error) {
      Logger.error('getChats error', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to find chats');
    }
  }
  /**
   * Get the id of invitation based on chat id and userId
   */
  async getInvitationId(chatId: string, userId: string): Promise<string | null> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: userId,
          chatId: chatId,
        },
      },
      select: {
        id: true,
      },
    });

    return participant ? participant.id : null;
  }
  /**
   * Get the status of invitation based on chat id and userId
   */
  async getParticipantStatus(chatId: string, userId: string): Promise<string | null> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: userId,
          chatId,
        },
      },
      select: {
        status: true,
      },
    });

    return participant ? participant.status : null;
  }

  /**
   * Get the id of recipent based on chatId and senderId
   */
  async getRecipientId(chatId: string, senderId: string): Promise<string> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const recipient = chat.participants.find(p => p.userId !== senderId);

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return recipient.userId;
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
        //! NULL CHECK: recipientId is required for creating new chat
        if (!recipientId) {
          throw new BadRequestException('recipientId is required when creating new chat');
        }

        // First message -> create a new DM chat
        const txResult = await client.$transaction(async (tx: any) => {
          // Create the DM chat (isGroup = false, no name/icon/creator)
          const chat = await tx.chat.create({
            data: {
              isGroup: false,
              latestMessageAt: new Date(),
            },
          });

          // Add participants
          await tx.chatParticipant.createMany({
            data: [
              { chatId: chat.id, userId: senderId, status: 'ACCEPTED' },
              { chatId: chat.id, userId: recipientId, status: 'PENDING' },
            ],
          });

          //! NULL CHECK: imageUrl and imageKey might be undefined
          const image = (imageUrl && imageKey)
              ? await tx.image.create({
                data: {
                  url: imageUrl,
                  key: imageKey,
                  userId: senderId,
                },
              })
              : null;

          //! NULL CHECK: content might be null for image-only, imageId might be undefined
          const message = await tx.message.create({
            data: {
              chatId: chat.id,
              senderId,
              content: content || null,
              imageId: image?.id || null,
            },
          });

          // Only create approval entries for image messages
          if (image) {
            const participants = await tx.chatParticipant.findMany({
              where: { chatId: chat.id },
              select: { userId: true, status: true },
            });

            const recipientIds = participants
                .filter((p: { userId: string; status: string }) => p.userId !== senderId)
                .map((p: { userId: string; status: string }) => ({
                  userId: p.userId,
                  approved: p.status === 'ACCEPTED',
                }));

            for (const { userId, approved } of recipientIds) {
              await tx.messageApproval.create({
                data: {
                  messageId: message.id,
                  userId,
                  approved,
                },
              });
            }
          }

          //! NULL CHECK: image?.url might be undefined
          return { chat, message: { ...message, imageUrl: image?.url || null } };
        });

        // Emit refresh signal to frontend (no message argument)
        this.chatGateway.emitNewMessage(txResult.chat.id, senderId);

        return {
          message: txResult.message as MessageDetails,
          chatCreated: true,
          chat: txResult.chat as ChatDetails,
        };
      }

      // Not the first message -> update existing chat
      const txResult = await client.$transaction(async (tx: any) => {
        const chat = await tx.chat.findUnique({
          where: { id: chatId },
          include: { participants: true },
        });

        if (!chat) {
          throw new NotFoundException('Chat not found');
        }

        const checkGroupType = await this.checkChatType(chatId);
        if (!checkGroupType.isGroup) {
          const recipient = await this.getRecipientId(chatId, senderId);
          const recipientParticipantStatus = await this.getParticipantStatus(chatId, recipient);
          const invitationId = await this.getInvitationId(chatId, recipient);
          if (recipientParticipantStatus === "DECLINED") {
            await client.chatParticipant.update({
              where: { id: invitationId },
              data: { status: 'PENDING' },
            });
          }
        }

        //! NULL CHECK: imageUrl and imageKey might be undefined
        const image = (imageUrl && imageKey)
            ? await tx.image.create({
              data: {
                url: imageUrl,
                key: imageKey,
                userId: senderId,
              },
            })
            : null;

        //! NULL CHECK: content might be null for image-only, imageId might be undefined
        const message = await tx.message.create({
          data: {
            chatId,
            senderId,
            content: content || null,
            imageId: image?.id || null,
          },
        });

        // Update the latestMessage timestamp in chat
        await tx.chat.update({
          where: { id: chatId },
          data: { latestMessageAt: new Date() },
        });

        // Only create approval entries for image messages
        if (image) {
          const participants = await tx.chatParticipant.findMany({
            where: { chatId: chat.id },
            select: { userId: true, status: true },
          });

          const recipientIds = participants
              .filter((p: { userId: string; status: string }) => p.userId !== senderId)
              .map((p: { userId: string; status: string }) => ({
                userId: p.userId,
                approved: p.status === 'ACCEPTED',
              }));

          for (const { userId, approved } of recipientIds) {
            await tx.messageApproval.create({
              data: {
                messageId: message.id,
                userId,
                approved,
              },
            });
          }
        }

        //! NULL CHECK: image?.url might be undefined
        return { chat, message: { ...message, imageUrl: image?.url || null } };
      });

      // Emit refresh signal to frontend (no message argument)
      this.chatGateway.emitNewMessage(txResult.chat.id, senderId);

      return {
        message: txResult.message as MessageDetails,
        chatCreated: false,
      };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      if (error && error.code === 'P2002') throw new ConflictException('Unique constraint violation');
      throw new InternalServerErrorException('Failed to send message');
    }
  }



  /**
   * Create a new 1-1 chat with initial participants
   */
  async createNormalChat(createGroupChatDetails: CreateGroupChatDetails): Promise<CreateGroupChatResults> {
    const client: any = this.prisma as any;
    const { creatorId, name, groupIcon, participantIds } = createGroupChatDetails;

    try {
      // Verify creator exists
      const creator = await client.user.findUnique({
        where: { id: creatorId }
      });

      if (!creator) {
        throw new NotFoundException('Creator user not found');
      }

      // Verify all participants exist
      const participants = await client.user.findMany({
        where: { id: { in: participantIds } }
      });

      if (participants.length !== participantIds.length) {
        throw new BadRequestException('One or more participant users not found');
      }

      const txResult = await client.$transaction(async (tx: any) => {
        // Create 1-1 chat
        const chat = await tx.chat.create({
          data: {
            isGroup: false,
            name:null,
            groupIcon: null,
            creatorId,
            latestMessageAt: new Date(),
          },
        });

        // Add creator as ACCEPTED participant
        await tx.chatParticipant.create({
          data: {
            chatId: chat.id,
            userId: creatorId,
            status: 'ACCEPTED',
          },
        });

        // Add other participants as PENDING
        for (const participantId of participantIds) {
          if (participantId !== creatorId) {
            await tx.chatParticipant.create({
              data: {
                chatId: chat.id,
                userId: participantId,
                status: 'PENDING',
              },
            });
          }
        }

        return { chat };
      });

      return {
        groupChat: txResult.groupChat as GroupChatDetails,
      };
    } catch (error) {
      Logger.error('createchat error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create 1-1 chat');
    }
  }

  /**
   * Check the chat is 1-1 or groupchat
   */
  async checkChatType(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, isGroup: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return {isGroup: chat.isGroup };
  }

  /**
   * Check if the 1-1 chat already exist given senderId and recipentId
   */

  async findExistingNormalChat(userId: string, receiverId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            OR: [
              { userId: userId },
              { userId: receiverId },
            ],
          },
        },
      },
    });

    return chat ? { exists: true, chatId: chat.id } : { exists: false };
  }

  /**
   * Search users for creating a 1-1 chat
   * If the chat already exists between senderId and recipentId
   *
   * Returns users matching the query string (searches by userId for now)
   */
  async searchUsersForNormalChatCreation(creatorId: string, searchQuery: string): Promise<any> {
    const client: any = this.prisma as any;

    try {
      // Search by userId substring match (case-insensitive)
      // TODO: Will search by username/name when those fields are added to User model
      const users = await client.user.findMany({
        where: {
          id: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          email: true,
          // TODO: Add username, firstName, lastName when available
        },
        take: 20, // Limit results to 20 users
      });

      // Get list of blocked user IDs for both directions
      const blocks = await client.userBlocking.findMany({
        where: {
          OR: [
            { blockerId: creatorId },
            { blockedId: creatorId },
          ],
        },
        select: {
          blockerId: true,
          blockedId: true,
        },
      });

      // Build a set of user IDs that should be excluded
      const blockedIds = new Set<string>();
      for (const b of blocks) {
        if (b.blockerId === creatorId) blockedIds.add(b.blockedId);
        if (b.blockedId === creatorId) blockedIds.add(b.blockerId);
      }

      // Filter out users you already have a normal chat with AND blocked ones
      const filteredUsers = [];
      for (const user of users) {
        if (blockedIds.has(user.id)) continue; // skip blocked users

        const chatCheck = await this.findExistingNormalChat(creatorId, user.id);
        if (!chatCheck.exists) {
          filteredUsers.push(user);
        }
      }

      return { users: filteredUsers };
    } catch (error) {
      Logger.error('searchUsersForNormalChatCreation error', error);
      throw new InternalServerErrorException('Failed to search users');
    }
  }


  /**
   * Approve image and if the reciever refresh the page,
   * they do not need to approve again
   */
  async approveMessage(messageId: string, userId: string) {
    return this.prisma.messageApproval.upsert({
      where: {
        messageId_userId: { messageId, userId }, // composite unique key
      },
      update: { approved: true },
      create: { messageId, userId, approved: true },
    });
  }
  /**
   * Get status of approval msg
   * True or false return
   */
  async approveMessageStatus(messageId: string, userId: string): Promise<boolean> {
    const approval = await this.prisma.messageApproval.findUnique({
      where: {
        messageId_userId: { messageId, userId }, // composite unique key
      },
      select: {
        approved: true,
      },
    });
    return approval ? approval.approved : false;
  }

  async getHistory(chatId: string, getMessagesDetails: getMessagesDetails
  ): Promise<getMessagesResults> {
    const client: any = this.prisma as any;
    const { userId } = getMessagesDetails;

    if (!chatId) {
      throw new BadRequestException('chatId is required');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Check if chat exists
    const chat = await client.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    const participant = await client.chatParticipant.findFirst({
      where: { chatId, userId },
      select: { status: true },
    });
    if (!participant) {
      throw new BadRequestException('You are not a participant of this chat');
    }

    // Fetch messages with approvals
    const rawMessages = await client.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        chatId: true,
        content: true,
        senderId: true,
        imageId: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        isDeleted: true,
        statuses: {
          where: { userId },
          select: { isDeleted: true },
        },
        image: {
          select: { url: true },
        },
        approvals: {
          select: {
            userId: true,
            approved: true,
          },
        },
        chat: {
          select: {
            participants: {
              select: {
                userId: true,
                status: true
              }
            }
          }
          },
      },
    });
    // Transform messages for frontend
    const messages = rawMessages.map((m: any) => {
      // Find approval for the current user from MessageApproval table
      const userApproval = m.approvals?.find(
          (a: { userId: string; approved: boolean }) => a.userId === userId
      );

      // Find the participant status from chat participants
      const participant = m.chat?.participants?.find(
          (p: { userId: string; status: string }) => p.userId === userId
      );

      return {
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        content: m.content || null,
        imageUrl: m.image?.url ?? null,
        isEdited: m.isEdited,
        isDeleted: m.isDeleted,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        isDeletedForYou: m.statuses?.[0]?.isDeleted ?? false,
        approvals: m.approvals?.map((a: { userId: string; approved: boolean }) => ({
          userId: a.userId,
          approved: a.approved,
        })) ?? [],
        // approved is true if either the MessageApproval says true OR participant is ACCEPTED
        approved: (userApproval?.approved ?? (participant?.status === 'ACCEPTED')),
      };
    }) as MessageWithStatusDetails[];

    return { messages };
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
  /*
   * Given userId, recieve a list of user that got blocked by userId
   */

  async getBlockedByUserId({ userId }: { userId: string }): Promise<{ id: string; email: string }[]> {
    const blockedRecords = await this.prisma.userBlocking.findMany({
      where: { blockerId: userId },
      include: { blocked: true } // include full user object
    });

    return blockedRecords.map((b) => ({
      id: b.blocked.id,
      email: b.blocked.email,
    }));
  }

  /*
   * Given userId, recieve a list of user who block userId
   */
  async getUsersWhoBlockedMeIds({ userId }: { userId: string }): Promise<string[]> {
    const blockers = await this.prisma.userBlocking.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    });
    return blockers.map((b) => b.blockerId);
  }

  /*
   * Given userId, recieve a list of user that userId can block
   */
  async getUserIdsCanBlock({ userId }: { userId: string }): Promise<{ id: string; email: string }[]> {
    // Fetch all users except the current user
    const allUsers = await this.prisma.user.findMany({
      where: { NOT: { id: userId } },
      select: { id: true, email: true },
    });

    // Get users that current user has blocked (full objects)
    const blockedByMe = await this.getBlockedByUserId({ userId });
    const blockedByMeSet = new Set(blockedByMe.map(u => u.id)); // only store IDs

    // Get users who have blocked me (already IDs)
    const blockedMe = await this.getUsersWhoBlockedMeIds({ userId });
    const blockedMeSet = new Set(blockedMe);

    // Filter out users already blocked by me OR who have blocked me
    return allUsers.filter(u => !blockedByMeSet.has(u.id) && !blockedMeSet.has(u.id));
  }

  /*
   * Block
   */
  async blockUser({ blockerId, blockedId }: blockUserDetails): Promise<void> {
    await this.prisma.userBlocking.create({
      data: { blockerId, blockedId },
    });
  }

  /*
   * Unblock
   */
  async unblockUser({ blockerId, blockedId }: unblockUserDetails): Promise<void> {
    await this.prisma.userBlocking.deleteMany({
      where: { blockerId, blockedId },
    });
  }

  /**
   * Returns true if user1 has blocked user2 OR user2 has blocked user1.
   */
  async isBlockedBetween(userId1: string, userId2: string): Promise<boolean> {
    const block = await this.prisma.userBlocking.findFirst({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });

    return !!block; // true if found, false if not
  }
}
