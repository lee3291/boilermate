import { UserMessageStatus } from '../interfaces/chat.interface';

export class MessageDto {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  statuses?: UserMessageStatus[];

  static fromEntity(e: any): MessageDto {
    return {
      id: e.id,
      chatId: e.chatId,
      senderId: e.senderId,
      content: e.content,
      isEdited: e.isEdited,
      isDeleted: e.isDeleted,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      statuses: e.statuses || [],
    };
  }
}

export class ChatHistoryResponse {
  message: string;
  data: MessageDto[];

  static fromEntities(entities: any[], message = 'OK') {
    return { message, data: entities.map(MessageDto.fromEntity) };
  }
}
