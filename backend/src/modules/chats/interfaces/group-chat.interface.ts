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
  polls?: PollDetails[];
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

export interface LeaveGroupChatDetails {
  userId: string; // User who wants to leave
}

export interface DeleteGroupChatDetails {
  creatorId: string;
}

export interface UserDetails { // technically will have to fetch from user modules
  userId: string;
  // will probably need for field to look nicer
}
export interface AddMembersQueryResults {
  users: UserDetails[];
}

//Related to poll

export interface PollDetails {
  id: string;
  question: string;
  //createdAt: Date;
  chatId: string;
  options: PollOptionDetails[];
}

export interface PollOptionDetails {
  id: string;
  text: string;
  votes: number; // default 0
}