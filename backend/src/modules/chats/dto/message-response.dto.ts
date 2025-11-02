import { Exclude, Type, Expose, plainToInstance } from 'class-transformer';
import { MessageWithStatusDetails, ChatDetails } from '../interfaces';

/**
 * @NOTE
 * You may ask, why do we need this => this is a clean of sending back a response to the client
 * Because there are things we may not want to send back for the sake of security and performance
 * We can use "decorator" to ensure that only the necessary information get sent back
 */

//* This section is used for standard declaration
@Exclude()
export class MessageApprovalDto {
  @Expose()
  userId: string;

  @Expose()
  approved: boolean;
}

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
  isDeleted: boolean; // Global delete status

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  imageUrl: string;

  @Expose()
  isDeletedForYou: boolean; // The key field for the "delete for me" status

  @Expose()
  @Type(() => MessageApprovalDto)
  approvals: MessageApprovalDto[];

  @Expose()
  approved: boolean;


  static fromInterface(rawMessageWithStatusDetails: MessageWithStatusDetails): MessageWithStatusDto {
    return plainToInstance(MessageWithStatusDto, rawMessageWithStatusDetails, { excludeExtraneousValues: true })
  }
}

//* This section is used for specific response (get, post, ...)

export class sendMessageResponseDto {
  idk: string; // this is basically a tracking message if you want it. technically unncessary
  message: MessageWithStatusDto;
  chat?: any; // ChatDto from chat-response

  static fromResult(
    MessageWithStatusDetails: MessageWithStatusDetails,
    chatDetails: ChatDetails | undefined,
    chatCreated: boolean
  ): sendMessageResponseDto {
    const response: sendMessageResponseDto = {
      idk: chatCreated ? 'New chat started and message sent.' : 'Message sent successfully.',
      message: MessageWithStatusDto.fromInterface(MessageWithStatusDetails),
    };

    if (chatCreated && chatDetails) {
      // Import ChatDto from chat-response dynamically to avoid circular dependency
      const { ChatDto } = require('./chat-response.dto');
      response.chat = ChatDto.fromInterface(chatDetails);
    }

    return response;
  }
}

export class getHistoryResponseDto {
  message: string;
  messages: MessageWithStatusDto[];

  static fromHistory(rawHistory: MessageWithStatusDetails[]): getHistoryResponseDto {
    const transformedList = rawHistory.map(MessageWithStatusDto.fromInterface);

    return {
      message: 'Chat history retrieved successfully',
      messages: transformedList,
    }
  }
}



