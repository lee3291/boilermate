/**
 * Message-related DTOs
 * Includes: Send, Edit, Delete, and GetHistory request DTOs
 */

/**
 * Payload to send a message.
 * Either provide `chatId` (existing chat) or provide `recipientId` (other user's id) to create/find the chat.
 */
export class SendMessageDto {
  chatId?: string; // doesn't have chatId if this is the first time sending message
  senderId: string;
  recipientId?: string; // technically shouldn't need recipient when sending to existing chat
  content?: string; // now optional as can send image without text
  imageUrl?: string // optional as no need to add image with a message
  imageKey?: string // optional => the key to the aws bucket
}

// technically shouldn't need userId as can use guard authorization to extract userId
export class EditMessageDto {
  content: string;
  userId: string;
}

// technically won't need userId as we can extract userId from the guard authorization
export class DeleteMessageDto {
  userId: string;
  forEveryone: string; // used to be boolean but have to change because of params only have string
}

// Technically won't need when we have a guard authorization as we can use that to get the userId anyway
export class GetHistoryDto {
  userId: string
}

