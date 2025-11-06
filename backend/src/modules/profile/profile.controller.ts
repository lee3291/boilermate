import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/decorators/user.decorator';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@User() user: { userId: string }) {
    return this.profileService.getProfile(user.userId);
  }

  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    return this.profileService.getPublicProfile(username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async updateProfile(
    @User() user: { userId: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('avatar')
  async updateAvatar(
    @User() user: { userId: string },
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    return this.profileService.updateAvatar(user.userId, updateAvatarDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateAccount(@User() user: { userId: string }) {
    await this.profileService.deactivateAccount(user.userId);
  }
}
