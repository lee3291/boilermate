//* This section is reserved for standard interfaces
export interface MessageWithStatus {
  id: string; // message id
  chatId: string // chat box id
  senderId: string // message owner
  content: string // message content
  isEdited: boolean // is this message been edited yet ?
  isDeleted: boolean // is this message been deleted for everyone yet?
  createdAt: Date;
  updatedAt: Date;
  isDeletedForYou?: boolean // this is a merge between the message with the message status table to form 1 single object for performance boost
}

export interface Chat {
  id: string;
  userAId: string;
  userBId: string;
  latestMessageAt: Date;
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
  content: string;
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