/**
 * Profile Controller
 * Handles HTTP requests for profile and matching endpoints
 */

import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { 
  GetProfileDetailsDto, 
  SearchUsersDto, 
  AddFavoriteDto, 
  RemoveFavoriteDto, 
  GetFavoritesDto,
  VoteUserDto,
  RemoveVoteDto,
  GetMyVotesDto,
  GetVoteStatsDto,
  ProfileDetailsDto, 
  SearchUsersResponseDto, 
  GetFavoritesResponseDto,
  VoteResponseDto,
  VoteStatsDto,
  GetMyVotesResponseDto
} from './dto';

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
  @HttpCode(200)
  async removeFavorite(
    @Param('favoritedUserId') favoritedUserId: string,
    @Query() dto: RemoveFavoriteDto
  ): Promise<{ message: string }> {
    dto.favoritedUserId = favoritedUserId;
    return this.profileService.removeFavorite(dto);
  }

  /**
   * GET /profile/:userId?viewerId=xxx
   * Get full profile details for a specific user
   * Include viewerId in query to check if profile is favorited by viewer
   */
  @Get(':userId')
  @HttpCode(200)
  async getProfile(
    @Param('userId') userId: string,
    @Query() dto: GetProfileDetailsDto,
  ): Promise<ProfileDetailsDto> {
    dto.userId = userId;
    // dto.viewerId comes from query params
    return this.profileService.getProfile(dto);
  }

  /**
   * POST /profile/votes
   * Vote on a user (LIKE or DISLIKE)
   * If vote already exists, it will be updated
   */
  @Post('votes')
  @HttpCode(200)
  async voteUser(@Body() dto: VoteUserDto): Promise<VoteResponseDto> {
    return this.profileService.voteUser(dto);
  }

  /**
   * DELETE /profile/votes/:votedUserId
   * Remove a vote from a user
   */
  @Delete('votes/:votedUserId')
  @HttpCode(200)
  async removeVote(
    @Param('votedUserId') votedUserId: string,
    @Query() dto: RemoveVoteDto
  ): Promise<{ message: string }> {
    dto.votedUserId = votedUserId;
    return this.profileService.removeVote(dto);
  }

  /**
   * GET /profile/votes/my-votes
   * Get all votes cast by current user
   * Optional: filter by voteType (LIKE or DISLIKE)
   * NOTE: Must be before /:userId route to avoid route conflict
   */
  @Get('votes/my-votes')
  @HttpCode(200)
  async getMyVotes(@Query() dto: GetMyVotesDto): Promise<GetMyVotesResponseDto> {
    return this.profileService.getMyVotes(dto);
  }

  /**
   * GET /profile/votes/stats/:userId
   * Get vote statistics for a user (likes and dislikes received)
   */
  @Get('votes/stats/:userId')
  @HttpCode(200)
  async getVoteStats(@Param('userId') userId: string): Promise<VoteStatsDto> {
    return this.profileService.getVoteStats({ userId });
  }
}
