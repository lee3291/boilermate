/**
 * Profile Service
 * Handles profile retrieval and matching logic
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { GetProfileDetailsDto, SearchUsersDto } from './dto';
import { ProfileDetailsDto, ProfileSummaryDto, SearchUsersResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current user's profile
   * TODO: Implement when user basic fields (username, firstName, lastName) are available
   * For now, returns a placeholder
   */
  async getMe(userId: string): Promise<any> {
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
   */
  async searchUsers(dto: SearchUsersDto): Promise<SearchUsersResponseDto> {
    const { userId, page = 1, limit = 10, preferenceIds, importanceOperator, importanceValue } = dto;

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
    const [users, total] = await Promise.all([
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
    ]);

    // Transform to DTOs
    const profiles = users.map((user: any) => ProfileSummaryDto.fromProfile(user));

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
}
