import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@modules/auth/decorators/user.decorator';

@Controller('user/settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUserSettings(@User() user: any) {
    const userId = user?.id || user?.userId || user?.sub;
    if (!userId) throw new BadRequestException('User ID not found in session');
    return this.userSettingsService.getUserSettings(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateUserSettings(
    @User() user: any,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ) {
    const userId = user?.id || user?.userId || user?.sub;
    if (!userId) throw new BadRequestException('User ID not found in session');
    return this.userSettingsService.updateUserSettings(
      userId,
      updateUserSettingsDto,
    );
  }
}


