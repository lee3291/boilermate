/**
 * Profile Service
 * Handles profile retrieval and matching logic
 */

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { GetProfileDetailsDto, SearchUsersDto, AddFavoriteDto, RemoveFavoriteDto, GetFavoritesDto } from './dto';
import { ProfileDetailsDto, ProfileSummaryDto, SearchUsersResponseDto, GetFavoritesResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current user's profile
   * TODO: Implement when user basic fields (username, firstName, lastName) are available
   * For now, returns a placeholder
   */
  async getMe(userId: string): Promise<any> {
    //! NULL CHECK: Validate userId is provided
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // TODO: Return full profile with user basic info + preferences
    // For now, return placeholder
    return {
      message: 'Profile endpoint - TODO: Implement when user model has username, firstName, lastName, profileImage',
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Get full profile details for a specific user
   * Includes lifestyle and roommate preferences (only PUBLIC if different user)
   */
  async getProfile(dto: GetProfileDetailsDto): Promise<ProfileDetailsDto> {
    const { userId, viewerId } = dto;

    //! NULL CHECK: Validate userId is provided
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Check if viewer is viewing their own profile
    const isSelfView = viewerId && viewerId === userId;

    // Fetch user with preferences
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilePreferences: {
          include: {
            preference: true,
          },
          // Filter by visibility if not self-view
          where: isSelfView ? {} : { visibility: 'PUBLIC' },
        },
        roommatePreferences: {
          include: {
            preference: true,
          },
          // Filter by visibility if not self-view
          where: isSelfView ? {} : { visibility: 'PUBLIC' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Transform to DTO
    return ProfileDetailsDto.fromProfile(user);
  }

  /**
   * Search for users based on their lifestyle preferences
   * Matches against the current user's roommate preferences
   * For simplicity: Only matches user's lifestyle preferences (ignoring their roommate preferences)
   * Also includes whether each user is favorited by the current user
   */
  async searchUsers(dto: SearchUsersDto): Promise<SearchUsersResponseDto> {
    const { userId, page = 1, limit = 10, preferenceIds, importanceOperator, importanceValue } = dto;

    //! NULL CHECK: Validate userId is provided
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Validate pagination params
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering by lifestyle preferences
    const whereClause: any = {
      id: { not: userId },
    };

    // If filtering by specific preferences
    if (preferenceIds && preferenceIds.length > 0) {
      const importanceCondition = this.buildImportanceCondition(importanceOperator, importanceValue);
      
      whereClause.profilePreferences = {
        some: {
          preferenceId: { in: preferenceIds },
          visibility: 'PUBLIC', // Only match against PUBLIC preferences
          ...importanceCondition,
        },
      };
    }

    // Fetch users with filters
    const [users, total, myFavorites] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              profilePreferences: true,
              roommatePreferences: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: whereClause,
      }),
      // Fetch all users favorited by current user (to mark them in results)
      this.prisma.favoriteMatch.findMany({
        where: {
          userId: userId,
        },
        select: {
          favoritedUserId: true,
        },
      }),
    ]);

    // Create a Set of favorited user IDs for quick lookup
    const favoritedUserIds = new Set(myFavorites.map(f => f.favoritedUserId));

    // Transform to DTOs with favorite status
    const profiles = users.map((user: any) => 
      ProfileSummaryDto.fromProfile(user, favoritedUserIds.has(user.id))
    );

    // Return paginated response
    return SearchUsersResponseDto.fromProfiles(
      profiles,
      total,
      page,
      limit
    );
  }

  /**
   * Build importance condition for filtering
   */
  private buildImportanceCondition(
    operator?: 'equal' | 'less_or_equal' | 'greater_or_equal',
    value?: number
  ): any {
    if (!operator || value === undefined) {
      return {};
    }

    switch (operator) {
      case 'equal':
        return { importance: value };
      case 'less_or_equal':
        return { importance: { lte: value } };
      case 'greater_or_equal':
        return { importance: { gte: value } };
      default:
        return {};
    }
  }

  /**
   * Add a user to favorites
   * Creates a FavoriteMatch record
   */
  async addFavorite(dto: AddFavoriteDto): Promise<{ message: string; favoriteId: string }> {
    const { userId, favoritedUserId } = dto;

    //! NULL CHECK: Validate required parameters
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!favoritedUserId) {
      throw new BadRequestException('favoritedUserId is required');
    }

    // Validate: Cannot favorite yourself
    if (userId === favoritedUserId) {
      throw new BadRequestException('Cannot favorite yourself');
    }

    // Validate: Favorited user exists
    const favoritedUser = await this.prisma.user.findUnique({
      where: { id: favoritedUserId },
    });

    if (!favoritedUser) {
      throw new NotFoundException(`User with ID ${favoritedUserId} not found`);
    }

    // Check if already favorited (unique constraint will throw error, but check explicitly for better UX)
    const existing = await this.prisma.favoriteMatch.findUnique({
      where: {
        userId_favoritedUserId: {
          userId,
          favoritedUserId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already in your favorites');
    }

    // Create favorite record
    const favorite = await this.prisma.favoriteMatch.create({
      data: {
        userId,
        favoritedUserId,
      },
    });

    return {
      message: 'User added to favorites successfully',
      favoriteId: favorite.id,
    };
  }

  /**
   * Remove a user from favorites
   * Deletes the FavoriteMatch record
   */
  async removeFavorite(dto: RemoveFavoriteDto): Promise<{ message: string }> {
    const { userId, favoritedUserId } = dto;

    //! NULL CHECK: Validate required parameters
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!favoritedUserId) {
      throw new BadRequestException('favoritedUserId is required');
    }

    // Find the favorite record
    const favorite = await this.prisma.favoriteMatch.findUnique({
      where: {
        userId_favoritedUserId: {
          userId,
          favoritedUserId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    // Delete the favorite record
    await this.prisma.favoriteMatch.delete({
      where: {
        id: favorite.id,
      },
    });

    return {
      message: 'User removed from favorites successfully',
    };
  }

  /**
   * Get all favorites for a user
   * Returns a paginated list of favorited users with summary info
   */
  async getFavorites(dto: GetFavoritesDto): Promise<GetFavoritesResponseDto> {
    const { userId, page = 1, limit = 20 } = dto;

    //! NULL CHECK: Validate userId is provided
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Validate pagination params
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch favorite matches with favorited user details
    const [favoriteMatches, total] = await Promise.all([
      this.prisma.favoriteMatch.findMany({
        where: {
          userId,
        },
        include: {
          favoritedUser: {
            include: {
              _count: {
                select: {
                  profilePreferences: true,
                  roommatePreferences: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc', // Most recently favorited first
        },
      }),
      this.prisma.favoriteMatch.count({
        where: {
          userId,
        },
      }),
    ]);

    // Transform to DTOs
    // All users in this list are favorited by definition (isFavoritedByMe = true)
    const favorites = favoriteMatches.map((match: any) => 
      ProfileSummaryDto.fromProfile(match.favoritedUser, true)
    );

    // Return paginated response
    return GetFavoritesResponseDto.fromFavorites(
      favorites,
      total,
      page,
      limit
    );
  }
}
