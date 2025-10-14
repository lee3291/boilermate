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
  key?: string // optional => the key to the aws bucket
}
