//* This section is reserved for standard interfaces
export interface Approval {
  msgId: string;
  userId: string;
  approved: boolean;
}
export interface MessageWithStatus {
  id: string; // message id
  chatId: string // chat box id
  senderId: string // message owner
  content?: string // message content => now optional as may only send image
  imageUrl?: string // image attached to a message => optional as may only send content
  isEdited: boolean // is this message been edited yet ?
  isDeleted: boolean // is this message been deleted for everyone yet?
  createdAt: Date;
  updatedAt: Date;
  isDeletedForYou?: boolean // this is a merge between the message with the message status table to form 1 single object for performance boost
  approvals?: Approval[];
}

// Participant details for chat members
export interface Participant {
  id: string; // userId
  email: string; // user email
  status: string; // ACCEPTED, PENDING, DECLINED
  // TODO: Add username, firstName, lastName when available
}

// OLD: DM-only chat interface
// export interface Chat {
//   id: string;
//   userAId: string;
//   userBId: string;
//   latestMessageAt: Date;
// }

// NEW: Updated to support both DM and Group chats
export interface Chat {
  id: string;
  isGroup: boolean; // true for group chats, false for DMs
  name?: string; // optional name for group chats (null for DMs)
  groupIcon?: string; // optional icon URL for group chats
  creatorId?: string; // creator's userId for group chats (null for DMs)
  latestMessageAt: Date;
  participants?: Participant[]; // NEW - list of all participants with their details
  // NOTE: userAId and userBId no longer exist - use participants for members
}

//* This section is reserved for api interfaces

export interface getChatsRequest {
  userId: string
}

export interface getChatsResponse {
  chats: Chat[]
}

export interface sendMessageRequest {
  chatId?: string; // doesn't have chatId if this is the first time sending message
  senderId: string;
  recipientId?: string; // technically shouldn't need recipient when sending to existing chat
  content?: string; // message text content, now could be optional as sent only image
  imageUrl?: string; // optional S3 image URL (key) from upload
  imageKey?: string; // optional, must have if have imageUrl
}

export interface sendMessageResponse {
  message: MessageWithStatus;
  chat: Chat;
}

export interface getHistoryRequest {
  userId: string;
}

export interface getHistoryResponse {
  messages: MessageWithStatus[]
}

export interface editMessageRequest {
  content: string;
  userId: string;
}

export interface deleteMessageRequest {
  userId: string;
  forEveryone: boolean;
}

export interface messageApprovalRequest {
  messageId: string;
  userId: string;
}

export interface messageApprovalResponse {
  messageId: string;
  approved: true;
}