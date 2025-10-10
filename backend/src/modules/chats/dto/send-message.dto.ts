/**
 * Payload to send a message.
 * Either provide `chatId` (existing chat) or provide `recipientId` (other user's id) to create/find the chat.
 * Note: validation decorators removed to avoid a hard dependency on class-validator in this patch.
 */
export class SendMessageDto {
  chatId?: string;
  senderId: string;
  recipientId: string;
  content: string;
}
