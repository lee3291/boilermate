import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { ChatDetails } from '../interfaces';

/**
 * Chat response DTOs (shared between DM and Group chats)
 */

@Exclude()
export class ChatDto {
  @Expose()
  id: string; // this is chatId

  @Expose()
  userAId: string;
  
  @Expose()
  userBId: string;
  
  @Expose()
  latestMessageAt: Date;

  static fromInterface(rawChatDetails: ChatDetails): ChatDto {
    return plainToInstance(ChatDto, rawChatDetails, { excludeExtraneousValues: true });
  }
}

export class getChatsResponseDto {
  message: string;
  chats: ChatDto[];

  static fromChats(rawChats: ChatDetails[]): getChatsResponseDto {
    const transformedList = rawChats.map(ChatDto.fromInterface);

    return {
      message: 'All chats of user retrieved sucessfully',
      chats: transformedList
    }
  }
}
