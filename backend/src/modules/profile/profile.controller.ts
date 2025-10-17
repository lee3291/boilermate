import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
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
  getProfile(@Req() req: AuthenticatedRequest) {
    // req.user is populated by the JWT strategy
    return this.profileService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.userId, updateProfileDto);
  }
}
