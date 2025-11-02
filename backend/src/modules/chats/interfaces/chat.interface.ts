/**
 * This is the place you create the interface to ensure type matching when working with the SERVICE of the MODULE
 * There are basically 2 interface you need for every API you created,
 */
//* This section is reserved for basic interface
export interface MessageApprovalDetails {
  userId: string;
  approved: boolean;
}
export interface MessageWithStatusDetails extends MessageDetails {
  approvals?: MessageApprovalDetails[];
  isDeletedForYou?: boolean // this is a merge between the message with the message status table to form 1 single object for performance boost
}

// User details for participants list, technically we fetch the UserDetails or not ????
// -> No as we don't need the full thing, we only need specific data for the chat
export interface ParticipantDetails {
  id: string; // userId
  email?: string; // user email
  status?: string; // ACCEPTED, PENDING, DECLINED
  // TODO: Add username, firstName, lastName when available in User model
}

export interface ChatDetails {
  id: string;
  //userAId: string; // OLD - commented out for group chat support
  //userBId: string; // OLD - commented out for group chat support
  isGroup: boolean; // needed so frontend can tell the difference
  name?: string; // name of group chat
  groupIcon?: string // url to the group icon -> this is basically reach ??? maybe not now
  creatorId?: string // owner of the group chat, will be NULL if it is just between 2 people
  latestMessageAt: Date;
  participants?: ParticipantDetails[]; // NEW - list of all participants with their details
}

export interface MessageDetails {
  id: string; // message id
  chatId: string // chat box id
  senderId: string // message owner
  content?: string // message content
  imageUrl?: string // the link to the image, no need to send back the imageId and key to frontend
  isEdited: boolean // is this message been edited yet ?
  isDeleted: boolean // is this message been deleted for everyone yet?
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
  recipientId?: string; // this now could be optional as we create a group chat, still need this to create chat between 2 users
  content?: string;
  imageUrl?: string; // need this to update the database
  imageKey?: string; // this is a special location of the image on the bucket
}
export interface sendMessageResults {
  message: MessageDetails;
  chatCreated: boolean; // return true for first time chat
  chat?: ChatDetails;
}

//* This section is reserved for getting the message history

export interface getMessagesDetails {
  userId: string, // shouldn't need this in the future when authorized
}

export interface getMessagesResults {
 messages: MessageWithStatusDetails[]
}

//* This section is reserved for editing a message, it should return MessageDetails
export interface editMessageDetails {
  // don't let them edit the picture lmao
  content: string,
  userId: string
}

//* This section is reserved for deleteing a message

export interface deleteMessageDetails {
  // may need to update as do we delete the message as well ???
  userId: string,
  forEveryone: string // used to be boolean but have to change as params only take string
}

