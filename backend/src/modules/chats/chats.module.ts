import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GroupChatsService } from './group-chats.service';
import { ChatsController } from './chats.controller';
import { PrismaModule } from '@core/database/prisma.module';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, GroupChatsService, ChatGateway],
  exports: [ChatsService, GroupChatsService],
})
export class ChatsModule {}
