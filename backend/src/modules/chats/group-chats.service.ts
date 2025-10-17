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
  DeleteGroupChatDetails,
  GroupChatDetails,
  InvitationDetails,
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
            name,
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
        include: {
          chat: {
            select: {
              id: true,
              name: true,
              groupIcon: true,
              isGroup: true,
              creatorId: true,
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
          userId_chatId: {
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
        await tx.chatParticipant.deleteMany({
          where: { chatId },
        });

        // Delete all message statuses for messages in this chat
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
      });
    } catch (error) {
      Logger.error('deleteGroupChat error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to delete group chat');
    }
  }
}