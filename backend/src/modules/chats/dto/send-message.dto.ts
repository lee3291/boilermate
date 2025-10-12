/**
 * Payload to send a message.
 * Either provide `chatId` (existing chat) or provide `recipientId` (other user's id) to create/find the chat.
 * Note: validation decorators removed to avoid a hard dependency on class-validator in this patch.
 */
export class SendMessageDto {
  chatId?: string; // doesn't have chatId if this is the first time sending message
  senderId: string;
  recipientId?: string; // technically shouldn't need recipient when sending to existing chat
  content: string;
}
