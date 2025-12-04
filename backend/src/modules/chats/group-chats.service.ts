import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
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
  PollDetails,
  PollOptionDetails,
} from './interfaces/group-chat.interface';

@Injectable()
export class GroupChatsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new group chat with initial participants
   */
  async createGroupChat(createGroupChatDetails: CreateGroupChatDetails): Promise<CreateGroupChatResults> {
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
        // Create the group chat
        const groupChat = await tx.chat.create({
          data: {
            isGroup: true,
            name, // Name will be null if it is 1-1 chat
            groupIcon: groupIcon || null,
            creatorId,
            latestMessageAt: new Date(),
          },
        });

        // Add creator as ACCEPTED participant
        await tx.chatParticipant.create({
          data: {
            chatId: groupChat.id,
            userId: creatorId,
            status: 'ACCEPTED',
          },
        });

        // Add other participants as PENDING
        for (const participantId of participantIds) {
          if (participantId !== creatorId) {
            await tx.chatParticipant.create({
              data: {
                chatId: groupChat.id,
                userId: participantId,
                status: 'PENDING',
              },
            });
          }
        }

        return { groupChat };
      });

      return {
        groupChat: txResult.groupChat as GroupChatDetails,
      };
    } catch (error) {
      Logger.error('createGroupChat error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create group chat');
    }
  }

  /**
   * Get all pending invitations for a user
   */
  async getInvitations(getInvitationsDetails: GetInvitationsDetails): Promise<GetInvitationsResults> {
    const client: any = this.prisma as any;
    const { userId } = getInvitationsDetails;

    try {
      const invitations = await client.chatParticipant.findMany({
        where: {
          userId,
          status: 'PENDING',
        },
        //TODO: MAY NEED TO CHECK FOR NULL ERROR
        include: {
          chat: {
            select: {
              id: true,
              name: true,
              groupIcon: true,
              isGroup: true,
              creatorId: true,
              participants: {
                select: {
                  id: true,
                  userId: true,
                  status: true,
                  user: {
                    select: {
                      id: true,
                      email: true,
                      legalName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        invitations: invitations as InvitationDetails[],
      };
    } catch (error) {
      Logger.error('getInvitations error', error);
      throw new InternalServerErrorException('Failed to get invitations');
    }
  }

  /**
   * Accept a pending invitation
   */
  async acceptInvitation(invitationId: string, acceptInvitationDetails: AcceptInvitationDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId } = acceptInvitationDetails;

    try {
      const invitation = await client.chatParticipant.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.userId !== userId) {
        throw new BadRequestException('You are not authorized to accept this invitation');
      }

      if (invitation.status !== 'PENDING') {
        throw new BadRequestException('Invitation is not pending');
      }

      await client.chatParticipant.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      await client.messageApproval.updateMany({
        where: {
          userId,
          message: {
            chatId: invitation.chatId, // link through relation
          },
          approved: false, // only update those still waiting
        },
        data: {
          approved: true,
        },
      });


    } catch (error) {
      Logger.error('acceptInvitation error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to accept invitation');
    }
  }

  /**
   * Decline a pending invitation
   */
  async declineInvitation(invitationId: string, declineInvitationDetails: DeclineInvitationDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId } = declineInvitationDetails;

    try {
      const invitation = await client.chatParticipant.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.userId !== userId) {
        throw new BadRequestException('You are not authorized to decline this invitation');
      }

      if (invitation.status !== 'PENDING') {
        throw new BadRequestException('Invitation is not pending');
      }

      await client.chatParticipant.update({
        where: { id: invitationId },
        data: { status: 'DECLINED' },
      });
    } catch (error) {
      Logger.error('declineInvitation error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to decline invitation');
    }
  }

  /**
   * Invite a new participant to an existing group (creator only)
   */
  async inviteParticipant(chatId: string, inviteParticipantDetails: InviteParticipantDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { creatorId, userId } = inviteParticipantDetails;

    try {
      const chat = await client.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!chat.isGroup) {
        throw new BadRequestException('This is not a group chat');
      }

      if (chat.creatorId !== creatorId) {
        throw new BadRequestException('Only the group creator can invite participants');
      }

      // Check if user exists
      const user = await client.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already a participant
      const existingParticipant = await client.chatParticipant.findUnique({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
      });

      if (existingParticipant) {
        throw new ConflictException('User is already a participant or has a pending invitation');
      }

      await client.chatParticipant.create({
        data: {
          chatId,
          userId,
          status: 'PENDING',
        },
      });
    } catch (error) {
      Logger.error('inviteParticipant error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to invite participant');
    }
  }

  /**
   * Remove a participant from a group (creator only)
   */
  async removeParticipant(chatId: string, userId: string, removeParticipantDetails: RemoveParticipantDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { creatorId } = removeParticipantDetails;

    try {
      const chat = await client.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!chat.isGroup) {
        throw new BadRequestException('This is not a group chat');
      }

      if (chat.creatorId !== creatorId) {
        throw new BadRequestException('Only the group creator can remove participants');
      }

      if (userId === creatorId) {
        throw new BadRequestException('Creator cannot remove themselves');
      }

      const participant = await client.chatParticipant.findUnique({
        where: {
          userId_chatId: { // prisma shorthand for and
            userId,
            chatId,
          },
        },
      });

      if (!participant) {
        throw new NotFoundException('Participant not found in this group');
      }

      await client.chatParticipant.delete({
        where: { id: participant.id },
      });
    } catch (error) {
      Logger.error('removeParticipant error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  /**
   * Leave a group chat
   * If the leaving user is the creator, transfer ownership to the first remaining ACCEPTED member
   */
  async leaveGroupChat(chatId: string, leaveGroupChatDetails: LeaveGroupChatDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId } = leaveGroupChatDetails;

    try {
      // check if the chat is valid
      const chat = await client.chat.findUnique({
        where: { id: chatId },
        include: {
          participants: {
            where: { status: 'ACCEPTED' },
            include: { user: true }
          }
        }
      });

      if (!chat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!chat.isGroup) {
        throw new BadRequestException('This is not a group chat');
      }

      // Check if user is a participant
      const userParticipant = chat.participants.find((p: any) => p.userId === userId);
      if (!userParticipant) {
        throw new BadRequestException('User is not a member of this group');
      }

      const isCreator = chat.creatorId === userId;
      const remainingMembers = chat.participants.filter((p: any) => p.userId !== userId);

      await client.$transaction(async (tx: any) => {
        // Remove the user's participant record
        await tx.chatParticipant.delete({
          where: {
            userId_chatId: {
              userId,
              chatId,
            }
          }
        });

        // If user was the creator and there are remaining members, transfer ownership
        if (isCreator && remainingMembers.length > 0) {
          const newCreatorId = remainingMembers[0].userId;
          await tx.chat.update({
            where: { id: chatId },
            data: { creatorId: newCreatorId }
          });
          Logger.log(`Transferred group ownership from ${userId} to ${newCreatorId} in chat ${chatId}`);
        } else if (isCreator && remainingMembers.length === 0) {
          // If creator is leaving and no one else is left, delete the group
          Logger.log(`Last member leaving, deleting group chat ${chatId}`);
          
          // Delete all message statuses
          await tx.userMessageStatus.deleteMany({
            where: {
              message: {
                chatId,
              },
            },
          });

          // Delete all messages
          await tx.message.deleteMany({
            where: { chatId },
          });

          // Delete the chat
          await tx.chat.delete({
            where: { id: chatId },
          });
        }
      });
    } catch (error) {
      Logger.error('leaveGroupChat error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to leave group chat');
    }
  }

  /**
   * Delete an entire group chat (creator only)
   */
  async deleteGroupChat(chatId: string, deleteGroupChatDetails: DeleteGroupChatDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { creatorId } = deleteGroupChatDetails;

    try {
      const chat = await client.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!chat.isGroup) {
        throw new BadRequestException('This is not a group chat');
      }

      if (chat.creatorId !== creatorId) {
        throw new BadRequestException('Only the group creator can delete the group');
      }

      await client.$transaction(async (tx: any) => {
        // Delete all participants
        // Get all message IDs
        const messages: { id: string }[] = await tx.message.findMany({
          where: { chatId },
          select: { id: true },
        });
        const messageIds = messages.map(m => m.id);

        // Delete all message that have image need approvals
        if (messageIds.length > 0) {
          await tx.messageApproval.deleteMany({
            where: {
              messageId: { in: messageIds },
            },
          });
        }

        // Delete all user message statuses
        if (messageIds.length > 0) {
          await tx.userMessageStatus.deleteMany({
            where: {
              messageId: { in: messageIds },
            },
          });
        }

        // Delete all messages
        await tx.message.deleteMany({
          where: { id: { in: messageIds } },
        });

        // Delete all participants
        await tx.chatParticipant.deleteMany({
          where: { chatId },
        });

        // Delete the chat itself
        await tx.chat.delete({
          where: { id: chatId },
        });
      });
    } catch (error) {
      Logger.error('deleteGroupChat error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to delete group chat');
    }
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

  /**
   * Search users for creating a new group chat
   * Returns users matching the query string (searches by userId for now)
   */
  async searchUsersForGroupCreation(creatorId: string, searchQuery: string): Promise<any> {
    const client: any = this.prisma as any;

    try {
      // Search by email substring match (case-insensitive)
      // Old code - Search by userId:
      // const users = await client.user.findMany({
      //   where: {
      //     id: {
      //       contains: searchQuery,
      //       mode: 'insensitive',
      //     },
      //   },
      //   select: {
      //     id: true,
      //     email: true,
      //   },
      //   take: 20,
      // });
      const users = await client.user.findMany({
        where: {
          email: {
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

      // Filter out blocked users
      const filteredUsers = users.filter((u: { id: string }) => !blockedIds.has(u.id));

      return { users: filteredUsers };
    } catch (error) {
      Logger.error('searchUsersForGroupCreation error', error);
      throw new InternalServerErrorException('Failed to search users');
    }
  }


  /**
   * Search users to add to an existing group chat
   * Excludes users who are already participants (ACCEPTED or PENDING)
   */
  async searchUsersForAddingToGroup(chatId: string, creatorId: string, searchQuery: string): Promise<{ users: any[] }> {
    const client: any = this.prisma as any;

    try {
      // 1. Verify chat exists and is a group
      const chat = await client.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!chat.isGroup) {
        throw new BadRequestException('This is not a group chat');
      }

      // 2. Get all existing participants (ACCEPTED, PENDING, DECLINED)
      const existingParticipants = await client.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
      });
      const existingUserIds = existingParticipants.map((p: any) => p.userId);

      // 3. Get all users blocked by creator or who blocked creator
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

      const blockedIds = new Set<string>();
      for (const b of blocks) {
        if (b.blockerId === creatorId) blockedIds.add(b.blockedId);
        if (b.blockedId === creatorId) blockedIds.add(b.blockerId);
      }

      // 4. Search users by email excluding blocked and existing participants
      // Old code - Search by userId:
      // const users = await client.user.findMany({
      //   where: {
      //     AND: [
      //       {
      //         id: {
      //           contains: searchQuery,
      //           mode: 'insensitive',
      //         },
      //       },
      //       {
      //         id: {
      //           notIn: [...existingUserIds, ...Array.from(blockedIds)],
      //         },
      //       },
      //     ],
      //   },
      //   select: {
      //     id: true,
      //     email: true,
      //   },
      //   take: 20,
      // });
      const users = await client.user.findMany({
        where: {
          AND: [
            {
              email: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              id: {
                notIn: [...existingUserIds, ...Array.from(blockedIds)],
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          // TODO: Add username, firstName, lastName when available
        },
        take: 20,
      });

      return { users };
    } catch (error) {
      Logger.error('searchUsersForAddingToGroup error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to search users');
    }
  }
  //Related to poll
  /*
   * Create new poll in the current chat
   */
  async createPoll(chatId: string, question: string, options: string[]): Promise<PollDetails> {
    const client: any = this.prisma as any;

    try {
      const chat = await client.chat.findUnique({ where: { id: chatId } });
      if (!chat) throw new NotFoundException('Chat not found');

      if (!question.trim()) throw new BadRequestException('Question cannot be empty');
      if (!options.length) throw new BadRequestException('Poll must have at least one option');

      const poll = await client.poll.create({
        data: {
          chatId,
          question,
          options: { create: options.map(text => ({ text })) }
        },
        include: { options: true }
      });

      return {
        id: poll.id,
        question: poll.question,
        chatId: poll.chatId,
        options: poll.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes
        }))
      };
    } catch (error) {
      Logger.error('createPoll error', error);
      throw new InternalServerErrorException('Failed to create poll');
    }
  }


  /*
   * Get all poll from current chat (include options)
   */
  async getPolls(chatId: string, userId: string): Promise<PollDetails[]> {
    const client: any = this.prisma as any;

    try {
      const chat = await client.chat.findUnique({ where: { id: chatId } });
      if (!chat) throw new NotFoundException('Chat not found');

      const polls = await client.poll.findMany({
        where: { chatId },
        include: {
          options: {
            include: {
              votesBy: {
                where: { userId }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return polls.map((poll: any) => ({
        id: poll.id,
        chatId: poll.chatId,
        question: poll.question,

        // Sort
        options: poll.options
            .sort((a: any, b: any) => b.votes - a.votes)
            .map((opt: any) => ({
              id: opt.id,
              text: opt.text,
              votes: opt.votes,
              votedByUser: opt.votesBy.length > 0
            }))
      }));
    } catch (error) {
      Logger.error('getPolls error', error);
      throw new InternalServerErrorException('Failed to fetch polls');
    }
  }



  /**
   * Add a new option to a poll
   */
  async addOption(pollId: string, text: string): Promise<PollOptionDetails> {
    const client: any = this.prisma as any;

    const poll = await client.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });

    if (!poll) throw new NotFoundException('Poll not found');
    if (!text.trim()) throw new BadRequestException('Option text cannot be empty');

    const exists = poll.options.some((opt: any) => opt.text === text);
    if (exists) throw new ConflictException('Option already exists');

    const newOpt = await client.pollOption.create({
      data: { pollId, text }
    });

    return {
      id: newOpt.id,
      text: newOpt.text,
      votes: newOpt.votes
    };
  }

  /*
   * Update vote from users
   */
  async submitVotes(userId: string, pollId: string, options: { id: string, selected: boolean }[]) {
    const client: any = this.prisma as any;

    for (const opt of options) {
      const hasVoted = await client.userPollVote.findUnique({
        where: { userId_pollOptionId: { userId, pollOptionId: opt.id } }
      });
      // Vote
      if (!hasVoted && opt.selected) {
        await client.userPollVote.create({
          data: { userId, pollOptionId: opt.id }
        });
        await client.pollOption.update({
          where: { id: opt.id },
          data: { votes: { increment: 1 } }
        });
      }
      //Unvote
      if (hasVoted && !opt.selected) {
        await client.userPollVote.delete({
          where: { userId_pollOptionId: { userId, pollOptionId: opt.id } }
        });
        await client.pollOption.update({
          where: { id: opt.id },
          data: { votes: { decrement: 1 } }
        });
      }
    }
  }


}