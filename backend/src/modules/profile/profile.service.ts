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
   * Get current user's full profile
   * Note: When viewing own profile, isFavoritedByMe is always false (can't favorite yourself)
   */
  async getMe(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
        profilePreferences: {
          include: {
            preference: true,
          },
        },
        roommatePreferences: {
          include: {
            preference: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Own profile is never favorited by self
    return ProfileDetailsDto.fromProfile(user, false);
  }

  /**
   * Get profile details for a specific user
   * Includes favorite status if viewerId is provided
   */
  async getProfile(dto: GetProfileDetailsDto): Promise<ProfileDetailsDto> {
    const { userId, viewerId } = dto;

    // Fetch user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
        profilePreferences: {
          include: {
            preference: true,
          },
        },
        roommatePreferences: {
          include: {
            preference: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if viewer has favorited this user (only if viewerId is provided and different from userId)
    let isFavoritedByMe = false;
    if (viewerId && viewerId !== userId) {
      const favorite = await this.prisma.favoriteMatch.findUnique({
        where: {
          userId_favoritedUserId: {
            userId: viewerId,
            favoritedUserId: userId,
          },
        },
      });
      isFavoritedByMe = !!favorite;
    }

    return ProfileDetailsDto.fromProfile(user, isFavoritedByMe);
  }

  /**
   * Search for users based on their lifestyle preferences
   * Matches against the current user's roommate preferences
   * For simplicity: Only matches user's lifestyle preferences (ignoring their roommate preferences)
   * Also includes whether each user is favorited by the current user
   */
  async searchUsers(dto: SearchUsersDto): Promise<SearchUsersResponseDto> {
    // Ensure page and limit are numbers (workaround until ValidationPipe is active)
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const { userId, preferenceIds, importanceOperator, importanceValue } = dto;

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
    // Ensure page and limit are numbers (workaround until ValidationPipe is active)
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const { userId } = dto;

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
