/**
 * Profile Controller
 * Handles HTTP requests for profile and matching endpoints
 */

import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetProfileDetailsDto, SearchUsersDto, AddFavoriteDto, RemoveFavoriteDto, GetFavoritesDto } from './dto';
import { ProfileDetailsDto, SearchUsersResponseDto, GetFavoritesResponseDto } from './dto/profile-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /profile/me
   * Get current user's profile
   * Query param: userId
   */
  @Get('me')
  @HttpCode(200)
  async getMe(@Query('userId') userId: string): Promise<any> {
    if (!userId) {
      throw new Error('userId is required');
    }

    return this.profileService.getMe(userId);
  }

  /**
   * GET /profile/search
   * Search for users based on lifestyle preferences
   * Query params: userId, page, limit, preferenceIds, importanceOperator, importanceValue
   */
  @Get('search')
  @HttpCode(200)
  async searchUsers(
    @Query('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('preferenceIds') preferenceIds?: string | string[],
    @Query('importanceOperator') importanceOperator?: 'equal' | 'less_or_equal' | 'greater_or_equal',
    @Query('importanceValue') importanceValue?: string,
  ): Promise<SearchUsersResponseDto> {
    if (!userId) {
      throw new Error('userId is required');
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
   * GET /profile/favorites/list
   * Get all favorites for current user
   * Query params: userId, page, limit
   * NOTE: Must be before /:userId route to avoid route conflict
   */
  @Get('favorites/list')
  @HttpCode(200)
  async getFavorites(
    @Query('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<GetFavoritesResponseDto> {
    if (!userId) {
      throw new Error('userId is required');
    }

    const dto = new GetFavoritesDto();
    dto.userId = userId;
    dto.page = page ? parseInt(page, 10) : 1;
    dto.limit = limit ? parseInt(limit, 10) : 20;

    return this.profileService.getFavorites(dto);
  }

  /**
   * POST /profile/favorites
   * Add a user to favorites
   * Body: { userId: string, favoritedUserId: string }
   */
  @Post('favorites')
  @HttpCode(201)
  async addFavorite(
    @Body() body: { userId: string; favoritedUserId: string },
  ): Promise<{ message: string; favoriteId: string }> {
    if (!body.userId) {
      throw new Error('userId is required');
    }

    if (!body.favoritedUserId) {
      throw new Error('favoritedUserId is required');
    }

    const dto = new AddFavoriteDto();
    dto.userId = body.userId;
    dto.favoritedUserId = body.favoritedUserId;

    return this.profileService.addFavorite(dto);
  }

  /**
   * DELETE /profile/favorites/:favoritedUserId
   * Remove a user from favorites
   * Query param: userId
   */
  @Delete('favorites/:favoritedUserId')
  @HttpCode(204)
  async removeFavorite(
    @Query('userId') userId: string,
    @Param('favoritedUserId') favoritedUserId: string,
  ): Promise<{ message: string }> {
    if (!userId) {
      throw new Error('userId is required');
    }

    const dto = new RemoveFavoriteDto();
    dto.userId = userId;
    dto.favoritedUserId = favoritedUserId;

    return this.profileService.removeFavorite(dto);
  }

  /**
   * GET /profile/:userId
   * Get full profile details for a specific user
   * Query params: viewerId (optional)
   */
  @Get(':userId')
  @HttpCode(200)
  async getProfile(
    @Param('userId') userId: string,
    @Query('viewerId') viewerId?: string,
  ): Promise<ProfileDetailsDto> {
    const dto = new GetProfileDetailsDto();
    dto.userId = userId;
    dto.viewerId = viewerId;

    return this.profileService.getProfile(dto);
  }
}
