/**
 * This is the place you create the interface to ensure type matching when working with the SERVICE of the MODULE
 * There are basically 2 interface you need for every API you created,
 */

//* This section is reserved for basic interface
export interface MessageWithStatusDetails {
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

//* This section is reserved for getting chatIds
export interface getChatsDetails {
  userId: string
}

export interface getChatsResults {
  chats: ChatDetails[]
}

//* This section is reserved for sending message

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
}

//* This section is reserved for getting the message history

export interface getMessagesDetails {
  userId: string,
}

export interface getMessagesResults {
 messages: MessageWithStatusDetails[]
}

//* This section is reserved for editing a message, it should return MessageDetails
export interface editMessageDetails {
  content: string,
  userId: string
}

//* This section is reserved for deleteing a message

export interface deleteMessageDetails {
  userId: string,
  forEveryone: boolean
}

