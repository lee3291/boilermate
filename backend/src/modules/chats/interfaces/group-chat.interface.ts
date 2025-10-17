export interface CreateGroupChatDetails {
  creatorId: string;
  name: string;
  groupIcon?: string;
  participantIds: string[];
}

export interface CreateGroupChatResults {
  groupChat: GroupChatDetails;
}

export interface GroupChatDetails {
  id: string;
  isGroup: boolean;
  name: string;
  groupIcon: string | null;
  creatorId: string;
  latestMessageAt: Date;
}

export interface GetInvitationsDetails {
  userId: string;
}

export interface GetInvitationsResults {
  invitations: InvitationDetails[];
}

export interface InvitationDetails {
  id: string;
  chatId: string;
  userId: string;
  status: string;
  chat?: any;
}

export interface AcceptInvitationDetails {
  userId: string;
}

export interface DeclineInvitationDetails {
  userId: string;
}

export interface InviteParticipantDetails {
  creatorId: string;
  userId: string;
}

export interface RemoveParticipantDetails {
  creatorId: string;
}

export interface DeleteGroupChatDetails {
  creatorId: string;
}
