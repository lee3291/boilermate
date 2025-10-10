import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode, Logger } from '@nestjs/common';
import { ChatsService } from './chats.service';
import {
  SendMessageDto,
  EditMessageDto,
  DeleteMessageDto,
  GetHistoryDto,
  sendMessageResponseDto,
  getHistoryResponseDto,
} from './dto';

/**
 * Chat endpoints
 */
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // Send message - either to existing chat or by recipientId
  @Post('messages')
  @HttpCode(201)
  async sendMessage(@Body() dto: SendMessageDto) {
    // temporary flow: senderId must be provided in the body
    // service expects the payload object that includes senderId
    Logger.log("message post", dto);
    
    const result = await this.chatsService.sendMessage(dto as any);

    Logger.log("wtf", result);

    return sendMessageResponseDto.fromResult(result.message, result.chat, result.chatCreated);
  }

  // Get chat history for a chat id
  @Get(':chatId/messages')
  @HttpCode(200)
  async getHistory(@Param('chatId') chatId: string, @Body() dto: GetHistoryDto) {
    const result = await this.chatsService.getHistory(chatId, dto as any);
    return getHistoryResponseDto.fromHistory(result.messages)
  }

  // Edit message
  @Put('messages/:messageId')
  @HttpCode(204)
  async editMessage(@Param('messageId') messageId: string, @Body() dto: EditMessageDto) {
    await this.chatsService.editMessage(messageId, dto);
  }

  // Delete message (for you or everyone)
  @Delete('messages/:messageId')
  @HttpCode(204)
  async deleteMessage(@Param('messageId') messageId: string, @Body() dto: DeleteMessageDto) {
    await this.chatsService.deleteMessage(messageId, dto);
  }
}
