/**
 * Group Chat-related request DTOs
 * Includes: Create, Invitations, Accept/Decline, Invite/Remove participants, Delete group
 */

export class CreateGroupChatDto {
  creatorId: string;
  name: string;
  groupIcon?: string;
  participantIds: string[]; // Initial members to invite
}

export class GetInvitationsDto {
  userId: string;
}

export class AcceptInvitationDto {
  userId: string;
}

export class DeclineInvitationDto {
  userId: string;
}

export class InviteParticipantDto {
  creatorId: string; // For authorization check
  userId: string; // User to invite
}

export class RemoveParticipantDto {
  creatorId: string; // For authorization check
}

export class DeleteGroupChatDto {
  creatorId: string; // For authorization check
}
