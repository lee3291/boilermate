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
   */
  @Get('me')
  @HttpCode(200)
  async getMe(@Query() dto: GetProfileDetailsDto): Promise<any> {
    return this.profileService.getMe(dto.userId);
  }

  /**
   * GET /profile/search
   * Search for users based on lifestyle preferences
   */
  @Get('search')
  @HttpCode(200)
  async searchUsers(@Query() dto: SearchUsersDto): Promise<SearchUsersResponseDto> {
    return this.profileService.searchUsers(dto);
  }

  /**
   * GET /profile/favorites/list
   * Get all favorites for current user
   * NOTE: Must be before /:userId route to avoid route conflict
   */
  @Get('favorites/list')
  @HttpCode(200)
  async getFavorites(@Query() dto: GetFavoritesDto): Promise<GetFavoritesResponseDto> {
    return this.profileService.getFavorites(dto);
  }

  /**
   * POST /profile/favorites
   * Add a user to favorites
   */
  @Post('favorites')
  @HttpCode(201)
  async addFavorite(@Body() dto: AddFavoriteDto): Promise<{ message: string; favoriteId: string }> {
    return this.profileService.addFavorite(dto);
  }

  /**
   * DELETE /profile/favorites/:favoritedUserId
   * Remove a user from favorites
   */
  @Delete('favorites/:favoritedUserId')
  @HttpCode(204)
  async removeFavorite(
    @Param('favoritedUserId') favoritedUserId: string,
    @Query() dto: RemoveFavoriteDto
  ): Promise<{ message: string }> {
    dto.favoritedUserId = favoritedUserId;
    return this.profileService.removeFavorite(dto);
  }

  /**
   * GET /profile/:userId
   * Get full profile details for a specific user
   */
  @Get(':userId')
  @HttpCode(200)
  async getProfile(
    @Param('userId') userId: string,
    @Query() dto: GetProfileDetailsDto,
  ): Promise<ProfileDetailsDto> {
    dto.userId = userId;
    return this.profileService.getProfile(dto);
  }
}
