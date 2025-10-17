import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    // The user's ID is attached to the request by the JwtAuthGuard
    return this.profileService.getProfile(req.user.userId);
  }

  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    return this.profileService.getPublicProfile(username);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.userId, updateProfileDto);
  }
}
