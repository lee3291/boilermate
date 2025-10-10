import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { MessageWithStatusDetails, ChatDetails } from '../interfaces';

/**
 * @NOTE
 * You may ask, why do we need this => this is a clean of sending back a response to the client
 * Because there are things we may not want to send back for the sake of security and performance
 * We can use "decorator" to ensure that only the necessary information get sent back
 */

//* This section is used for standard declaration

@Exclude()
export class MessageWithStatusDto {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  senderId: string;

  @Expose()
  content: string;
  
  @Expose()
  isEdited: boolean; // Global edit status

  @Expose()
  isDeleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  isDeletedForYou: boolean; // The key field for the "delete for me" status

  static fromInterface(rawMessageWithStatusDetails: MessageWithStatusDetails): MessageWithStatusDto {
    return plainToInstance(MessageWithStatusDto, rawMessageWithStatusDetails, { excludeExtraneousValues: true })
  }
}

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

//* This section is used for specific response (get, post, ...)

export class sendMessageResponseDto {
  message: string; // this is basically a tracking message if you want it. technically unncessary
  data: MessageWithStatusDto;
  chat?: ChatDto;

  static fromResult(
    MessageWithStatusDetails: MessageWithStatusDetails,
    chatDetails: ChatDetails | undefined,
    chatCreated: boolean
  ): sendMessageResponseDto {
    const response: sendMessageResponseDto = {
      message: chatCreated ? 'New chat started and message sent.' : 'Message sent successfully.',
      data: MessageWithStatusDto.fromInterface(MessageWithStatusDetails),
    };

    if (chatCreated && chatDetails) {
      response.chat = ChatDto.fromInterface(chatDetails);
    }

    return response;
  }
}

export class getHistoryResponseDto {
  message: string;
  data: MessageWithStatusDto[];

  static fromHistory(rawHistory: MessageWithStatusDetails[]): getHistoryResponseDto {
    const transformedList = rawHistory.map(MessageWithStatusDto.fromInterface);

    return {
      message: 'Chat history retrieved successfully',
      data: transformedList,
    }
  }
}



