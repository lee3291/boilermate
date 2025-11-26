import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../core/database/prisma.module';
import { MailModule } from '../mail/mail.module';
import { TasksController } from './tasks.controller';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
