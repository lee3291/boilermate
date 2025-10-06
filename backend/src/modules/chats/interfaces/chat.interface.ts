/**
 * Minimal interfaces that match Prisma generated entities used by the chat module
 */
export interface ChatDetails {
  id: string;
  userAId: string;
  userBId: string;
  latestMessageAt: Date;
}

export interface MessageDetails {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMessageStatusDetails {
  id: number;
  userId: string;
  messageId: string;
  isDeleted: boolean;
  isRead: boolean;
}

export interface sendMessageDetails {
  chatId?: string;
  senderId: string;
  recipientId: string;
  content: string;
}
export interface sendMessageResults {
  message: MessageDetails;
  chatCreated: boolean; // return true for first time chat
  chat?: ChatDetails;
  statues: UserMessageStatusDetails;
}

export interface getMessagesDetails {
  chatId: string,
  userId: string,
}

export interface getMessagesResults {
  messages: MessageDetails[],
  statues: UserMessageStatusDetails[],
}
