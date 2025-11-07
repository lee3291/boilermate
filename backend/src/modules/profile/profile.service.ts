/**
 * Profile Service
 * Handles profile retrieval and matching logic
 */

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
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
  ProfileSummaryDto, 
  SearchUsersResponseDto, 
  GetFavoritesResponseDto,
  VoteResponseDto,
  VoteStatsDto,
  GetMyVotesResponseDto
} from './dto';

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

    // Get vote counts for own profile
    const [likesReceived, dislikesReceived] = await Promise.all([
      this.prisma.userVote.count({
        where: { votedUserId: userId, voteType: 'LIKE' },
      }),
      this.prisma.userVote.count({
        where: { votedUserId: userId, voteType: 'DISLIKE' },
      }),
    ]);

    // Own profile is never favorited by self and has no vote
    return ProfileDetailsDto.fromProfile(user, false, null, likesReceived, dislikesReceived);
  }

  /**
   * Get profile details for a specific user
   * Includes favorite status if viewerId is provided
   * IMPORTANT: Only returns PUBLIC preferences when viewed by others
   */
  async getProfile(dto: GetProfileDetailsDto): Promise<ProfileDetailsDto> {
    const { userId, viewerId } = dto;

    // Determine if this is self-view or other-view
    const isSelfView = viewerId === userId;

    // Fetch user profile
    // If viewing own profile, show all preferences
    // If viewing someone else's profile, only show PUBLIC preferences
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
        profilePreferences: {
          where: isSelfView ? undefined : { visibility: 'PUBLIC' },
          include: {
            preference: true,
          },
        },
        roommatePreferences: {
          where: isSelfView ? undefined : { visibility: 'PUBLIC' },
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
    let myVoteType: 'LIKE' | 'DISLIKE' | null = null;
    
    if (viewerId && viewerId !== userId) {
      const [favorite, vote] = await Promise.all([
        this.prisma.favoriteMatch.findUnique({
          where: {
            userId_favoritedUserId: {
              userId: viewerId,
              favoritedUserId: userId,
            },
          },
        }),
        this.prisma.userVote.findUnique({
          where: {
            voterId_votedUserId: {
              voterId: viewerId,
              votedUserId: userId,
            },
          },
        }),
      ]);
      
      isFavoritedByMe = !!favorite;
      myVoteType = vote?.voteType || null;
    }

    // Get vote counts for this profile
    const [likesReceived, dislikesReceived] = await Promise.all([
      this.prisma.userVote.count({
        where: { votedUserId: userId, voteType: 'LIKE' },
      }),
      this.prisma.userVote.count({
        where: { votedUserId: userId, voteType: 'DISLIKE' },
      }),
    ]);

    return ProfileDetailsDto.fromProfile(user, isFavoritedByMe, myVoteType, likesReceived, dislikesReceived);
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
    const { userId, preferenceIds: preferenceIdsString, importanceOperator, importanceValue: importanceValueRaw } = dto;

    // Parse comma-separated preferenceIds string into array
    const preferenceIds = preferenceIdsString 
      ? preferenceIdsString.split(',').map(id => id.trim()).filter(id => id.length > 0)
      : [];

    // Ensure importanceValue is a number
    const importanceValue = importanceValueRaw ? Number(importanceValueRaw) : undefined;

    console.log('Search filters:', { preferenceIds, importanceOperator, importanceValue });

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering by lifestyle preferences
    const whereClause: any = {
      id: { not: userId },
    };

    // If filtering by specific preferences
    if (preferenceIds.length > 0) {
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
    // Note: _count only includes PUBLIC preferences since we're viewing others' profiles
    const [users, total, myFavorites, myVotes] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              profilePreferences: {
                where: { visibility: 'PUBLIC' },
              },
              roommatePreferences: {
                where: { visibility: 'PUBLIC' },
              },
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
      // Fetch all votes cast by current user (to mark them in results)
      this.prisma.userVote.findMany({
        where: {
          voterId: userId,
        },
        select: {
          votedUserId: true,
          voteType: true,
        },
      }),
    ]);

    // Create a Set of favorited user IDs for quick lookup
    const favoritedUserIds = new Set(myFavorites.map(f => f.favoritedUserId));

    // Create a Map of voted user IDs -> vote type for quick lookup
    const myVoteMap = new Map<string, 'LIKE' | 'DISLIKE'>();
    myVotes.forEach(vote => {
      myVoteMap.set(vote.votedUserId, vote.voteType);
    });

    // Get vote counts for all users in results
    const userIds = users.map(u => u.id);
    const voteCounts = await this.prisma.userVote.groupBy({
      by: ['votedUserId', 'voteType'],
      where: {
        votedUserId: { in: userIds },
      },
      _count: true,
    });

    // Build a map of userId -> {likes, dislikes}
    const voteMap = new Map<string, { likes: number; dislikes: number }>();
    voteCounts.forEach((vc: any) => {
      if (!voteMap.has(vc.votedUserId)) {
        voteMap.set(vc.votedUserId, { likes: 0, dislikes: 0 });
      }
      const counts = voteMap.get(vc.votedUserId)!;
      if (vc.voteType === 'LIKE') {
        counts.likes = vc._count;
      } else {
        counts.dislikes = vc._count;
      }
    });

    // Transform to DTOs with favorite status, vote status, and vote counts
    const profiles = users.map((user: any) => {
      const votes = voteMap.get(user.id) || { likes: 0, dislikes: 0 };
      const myVote = myVoteMap.get(user.id) || null;
      return ProfileSummaryDto.fromProfile(
        user, 
        favoritedUserIds.has(user.id),
        myVote,
        votes.likes,
        votes.dislikes
      );
    });

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
    // Note: _count only includes PUBLIC preferences since we're viewing others' profiles
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
                  profilePreferences: {
                    where: { visibility: 'PUBLIC' },
                  },
                  roommatePreferences: {
                    where: { visibility: 'PUBLIC' },
                  },
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
    // Get vote counts and current user's votes for favorited users
    const userIds = favoriteMatches.map((m: any) => m.favoritedUser.id);
    
    const [voteCounts, myVotes] = await Promise.all([
      this.prisma.userVote.groupBy({
        by: ['votedUserId', 'voteType'],
        where: {
          votedUserId: { in: userIds },
        },
        _count: true,
      }),
      this.prisma.userVote.findMany({
        where: {
          voterId: userId,
          votedUserId: { in: userIds },
        },
        select: {
          votedUserId: true,
          voteType: true,
        },
      }),
    ]);

    // Build vote map
    const voteMap = new Map<string, { likes: number; dislikes: number }>();
    voteCounts.forEach((vc: any) => {
      if (!voteMap.has(vc.votedUserId)) {
        voteMap.set(vc.votedUserId, { likes: 0, dislikes: 0 });
      }
      const counts = voteMap.get(vc.votedUserId)!;
      if (vc.voteType === 'LIKE') {
        counts.likes = vc._count;
      } else {
        counts.dislikes = vc._count;
      }
    });

    // Build my votes map
    const myVoteMap = new Map<string, 'LIKE' | 'DISLIKE'>();
    myVotes.forEach(vote => {
      myVoteMap.set(vote.votedUserId, vote.voteType);
    });

    const favorites = favoriteMatches.map((match: any) => {
      const votes = voteMap.get(match.favoritedUser.id) || { likes: 0, dislikes: 0 };
      const myVote = myVoteMap.get(match.favoritedUser.id) || null;
      return ProfileSummaryDto.fromProfile(match.favoritedUser, true, myVote, votes.likes, votes.dislikes);
    });

    // Return paginated response
    return GetFavoritesResponseDto.fromFavorites(
      favorites,
      total,
      page,
      limit
    );
  }

  /**
   * Vote on a user (LIKE or DISLIKE)
   * Creates or updates a UserVote record
   */
  async voteUser(dto: VoteUserDto): Promise<VoteResponseDto> {
    const { voterId, votedUserId, voteType } = dto;

    // Validate: Cannot vote for yourself
    if (voterId === votedUserId) {
      throw new BadRequestException('Cannot vote for yourself');
    }

    // Validate: Voted user exists
    const votedUser = await this.prisma.user.findUnique({
      where: { id: votedUserId },
    });

    if (!votedUser) {
      throw new NotFoundException(`User with ID ${votedUserId} not found`);
    }

    // Check if vote already exists
    const existingVote = await this.prisma.userVote.findUnique({
      where: {
        voterId_votedUserId: {
          voterId,
          votedUserId,
        },
      },
    });

    let vote;
    let message: string;

    if (existingVote) {
      // Update existing vote
      vote = await this.prisma.userVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          voteType,
        },
      });
      message = `Vote updated to ${voteType} successfully`;
    } else {
      // Create new vote
      vote = await this.prisma.userVote.create({
        data: {
          voterId,
          votedUserId,
          voteType,
        },
      });
      message = `User ${voteType === 'LIKE' ? 'liked' : 'disliked'} successfully`;
    }

    const response = new VoteResponseDto();
    response.message = message;
    response.voteId = vote.id;
    response.voteType = vote.voteType as 'LIKE' | 'DISLIKE';
    return response;
  }

  /**
   * Remove a vote from a user
   * Deletes the UserVote record
   */
  async removeVote(dto: RemoveVoteDto): Promise<{ message: string }> {
    const { voterId, votedUserId } = dto;

    // Find the vote record
    const vote = await this.prisma.userVote.findUnique({
      where: {
        voterId_votedUserId: {
          voterId,
          votedUserId,
        },
      },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    // Delete the vote record
    await this.prisma.userVote.delete({
      where: {
        id: vote.id,
      },
    });

    return {
      message: 'Vote removed successfully',
    };
  }

  /**
   * Get all votes cast by a user
   * Optionally filter by vote type (LIKE or DISLIKE)
   */
  async getMyVotes(dto: GetMyVotesDto): Promise<GetMyVotesResponseDto> {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const { voterId, voteType } = dto;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      voterId,
    };

    if (voteType) {
      whereClause.voteType = voteType;
    }

    // Fetch votes with voted user details
    // Note: _count only includes PUBLIC preferences since we're viewing others' profiles
    const [votes, total] = await Promise.all([
      this.prisma.userVote.findMany({
        where: whereClause,
        include: {
          votedUser: {
            include: {
              _count: {
                select: {
                  profilePreferences: {
                    where: { visibility: 'PUBLIC' },
                  },
                  roommatePreferences: {
                    where: { visibility: 'PUBLIC' },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.userVote.count({
        where: whereClause,
      }),
    ]);

    // Transform to DTOs
    // Get vote counts and check favorite status for voted users
    const userIds = votes.map((v: any) => v.votedUser.id);
    
    const [voteCounts, favorites] = await Promise.all([
      this.prisma.userVote.groupBy({
        by: ['votedUserId', 'voteType'],
        where: {
          votedUserId: { in: userIds },
        },
        _count: true,
      }),
      this.prisma.favoriteMatch.findMany({
        where: {
          userId: voterId,
          favoritedUserId: { in: userIds },
        },
        select: {
          favoritedUserId: true,
        },
      }),
    ]);

    // Build vote map
    const voteMap = new Map<string, { likes: number; dislikes: number }>();
    voteCounts.forEach((vc: any) => {
      if (!voteMap.has(vc.votedUserId)) {
        voteMap.set(vc.votedUserId, { likes: 0, dislikes: 0 });
      }
      const counts = voteMap.get(vc.votedUserId)!;
      if (vc.voteType === 'LIKE') {
        counts.likes = vc._count;
      } else {
        counts.dislikes = vc._count;
      }
    });

    // Build favorites set
    const favoritedUserIds = new Set(favorites.map(f => f.favoritedUserId));

    const votedProfiles = votes.map((vote: any) => {
      const voteCounts = voteMap.get(vote.votedUser.id) || { likes: 0, dislikes: 0 };
      const isFavorited = favoritedUserIds.has(vote.votedUser.id);
      return ProfileSummaryDto.fromProfile(
        vote.votedUser, 
        isFavorited, 
        vote.voteType, 
        voteCounts.likes, 
        voteCounts.dislikes
      );
    });

    return GetMyVotesResponseDto.fromVotes(
      votedProfiles,
      total,
      page,
      limit,
      voteType
    );
  }

  /**
   * Get vote statistics for a user
   * Returns how many likes and dislikes they have received
   */
  async getVoteStats(dto: GetVoteStatsDto): Promise<VoteStatsDto> {
    const { userId } = dto;

    // Validate: User exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Count likes and dislikes
    const [likesReceived, dislikesReceived] = await Promise.all([
      this.prisma.userVote.count({
        where: {
          votedUserId: userId,
          voteType: 'LIKE',
        },
      }),
      this.prisma.userVote.count({
        where: {
          votedUserId: userId,
          voteType: 'DISLIKE',
        },
      }),
    ]);

    return VoteStatsDto.fromStats(userId, likesReceived, dislikesReceived);
  }
}
