import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';
import { ChatDetails, ParticipantDetails } from '../interfaces';

/**
 * Chat response DTOs (shared between DM and Group chats)
 */

@Exclude()
export class ParticipantDto {
  @Expose()
  id: string; // userId

  @Expose()
  email: string;

  @Expose()
  status: string; // ACCEPTED, PENDING, DECLINED

  // TODO: Add username, firstName, lastName when available

  static fromInterface(rawParticipant: ParticipantDetails): ParticipantDto {
    return plainToInstance(ParticipantDto, rawParticipant, { excludeExtraneousValues: true });
  }
}

@Exclude()
export class ChatDto {
  @Expose()
  id: string; // this is chatId

  // OLD - commented out for group chat support
  // @Expose()
  // userAId: string;
  // @Expose()
  // userBId: string;

  @Expose()
  isGroup: boolean;

  @Expose()
  name?: string;

  @Expose()
  groupIcon?: string

  @Expose()
  creatorId?: string
  
  @Expose()
  latestMessageAt: Date;

  @Expose()
  @Type(() => ParticipantDto) // Transform nested array of participants
  participants?: ParticipantDto[];

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
