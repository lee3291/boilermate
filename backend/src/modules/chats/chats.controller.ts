import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe, Req, } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { DeleteMessageDto } from './dtos/delete-message.dto';
import { ChatHistoryResponse } from './dtos/message-response.dto';

/**
 * Chat endpoints
 */
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // Send message - either to existing chat or by recipientId
  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto) {
    // temporary flow: senderId must be provided in the body
    // service expects the payload object that includes senderId
    const result = await this.chatsService.sendMessage(dto as any);
    return { message: 'Message sent', data: result };
  }

  // Get chat history for a chat id
  @Get(':chatId/messages')
  async getHistory(@Param('chatId') chatId: string) {
    const messages = await this.chatsService.getHistory(chatId);
    return ChatHistoryResponse.fromEntities(messages);
  }

  // Edit message
  @Put('messages/:messageId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async editMessage(@Req() req: any, @Param('messageId') messageId: string, @Body() dto: EditMessageDto) {
    const senderId = req.userId as string;
    const updated = await this.chatsService.editMessage(messageId, senderId, dto);
    return { message: 'Message updated', data: updated };
  }

  // Delete message (for you or everyone)
  @Delete('messages/:messageId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async deleteMessage(@Req() req: any, @Param('messageId') messageId: string, @Body() dto: DeleteMessageDto) {
    const userId = req.userId as string;
    const result = await this.chatsService.deleteMessage(messageId, userId, dto);
    return { message: 'Message deleted', data: result };
  }
}
