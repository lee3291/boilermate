import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('run-outdated-check')
  @HttpCode(HttpStatus.OK)
  async runOutdatedListingCheck() {
    await this.tasksService.handleOutdatedListingReminders();
    await this.tasksService.handleArchivingOutdatedListings();
    return { message: 'Outdated listing check completed successfully.' };
  }
}
