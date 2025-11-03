/**
 * Profile Controller
 * Handles HTTP requests for profile and matching endpoints
 */

import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetProfileDetailsDto, SearchUsersDto } from './dto';
import { ProfileDetailsDto, SearchUsersResponseDto } from './dto/profile-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /profile/me
   * Get current user's profile
   * TODO: Implement when user basic fields are available
   */
  @Get('me')
  async getMe(@Request() req: any): Promise<any> {
    // TODO: Extract userId from JWT token when auth is implemented
    // For now, use hardcoded or query param
    const userId = req.user?.id || req.query?.userId;
    
    if (!userId) {
      throw new Error('User ID is required. TODO: Extract from JWT token');
    }

    return this.profileService.getMe(userId);
  }

  /**
   * GET /profile/search
   * Search for users based on lifestyle preferences
   * Query params: page, limit, preferenceIds, importanceOperator, importanceValue
   */
  @Get('search')
  async searchUsers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('preferenceIds') preferenceIds?: string | string[],
    @Query('importanceOperator') importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal',
    @Query('importanceValue') importanceValue?: string,
  ): Promise<SearchUsersResponseDto> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.id || req.query?.userId;
    
    if (!userId) {
      throw new Error('User ID is required. TODO: Extract from JWT token');
    }

    const dto = new SearchUsersDto();
    dto.userId = userId;
    dto.page = page ? parseInt(page, 10) : 1;
    dto.limit = limit ? parseInt(limit, 10) : 10;
    
    // Parse preferenceIds (can be single string or array)
    if (preferenceIds) {
      dto.preferenceIds = Array.isArray(preferenceIds) ? preferenceIds : [preferenceIds];
    }
    
    dto.importanceOperator = importanceOperator;
    dto.importanceValue = importanceValue ? parseInt(importanceValue, 10) : undefined;

    return this.profileService.searchUsers(dto);
  }

  /**
   * GET /profile/:userId
   * Get full profile details for a specific user
   * Optionally provide viewerId for match score calculation
   */
  @Get(':userId')
  async getProfile(
    @Param('userId') userId: string,
    @Request() req: any,
    @Query('viewerId') viewerIdQuery?: string,
  ): Promise<ProfileDetailsDto> {
    // TODO: Extract viewerId from JWT token when auth is implemented
    const viewerId = req.user?.id || viewerIdQuery;

    const dto = new GetProfileDetailsDto();
    dto.userId = userId;
    dto.viewerId = viewerId;

    return this.profileService.getProfile(dto);
  }
}
