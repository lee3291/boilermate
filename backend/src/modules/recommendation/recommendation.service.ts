import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ChatsService } from '../chats/chats.service';
import {
  GetRecommendationsDetails,
  GetRecommendationsResults,
  AcceptRecommendationDetails,
  AcceptRecommendationResults,
  DeclineRecommendationDetails,
  DeclineRecommendationResults,
  RecommendationDetails,
} from './interfaces';

/**
 * RecommendationService
 * Handles querying recommendations and user interactions (accept/decline)
 * Scoring logic is in recommendation-scheduler.service.ts
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
  ) {}

  /**
   * Get top recommendations for a user
   * Returns precomputed scores from RecommendationScore table
   */
  async getRecommendations(
    details: GetRecommendationsDetails,
  ): Promise<GetRecommendationsResults> {
    const { userId } = details;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get recommendations (exclude hidden ones)
    const recommendations = await this.prisma.recommendationScore.findMany({
      where: {
        userId,
        hidden: false,
      },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
            bio: true,
            _count: {
              select: {
                profilePreferences: true,
                roommatePreferences: true,
                votesReceived: true,
              },
            },
            votesReceived: {
              select: {
                voteType: true,
              },
            },
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
      take: 20, // Top 20 matches
    });

    const mappedRecommendations: RecommendationDetails[] = recommendations.map(
      (rec) => {
        // Calculate likes and dislikes from votesReceived
        const likesReceived = rec.candidate?.votesReceived?.filter(v => v.voteType === 'LIKE').length || 0;
        const dislikesReceived = rec.candidate?.votesReceived?.filter(v => v.voteType === 'DISLIKE').length || 0;

        return {
          id: rec.id,
          userId: rec.userId,
          candidateId: rec.candidateId,
          score: rec.score,
          reasons: rec.reasons as any,
          hidden: rec.hidden,
          createdAt: rec.createdAt,
          updatedAt: rec.updatedAt,
          candidate: rec.candidate
            ? {
                id: rec.candidate.id,
                email: rec.candidate.email,
                legalName: rec.candidate.legalName || undefined,
                avatarURL: rec.candidate.avatarURL || undefined,
                bio: rec.candidate.bio || undefined,
                lifestylePreferencesCount: rec.candidate._count?.profilePreferences || 0,
                roommatePreferencesCount: rec.candidate._count?.roommatePreferences || 0,
                likesReceived,
                dislikesReceived,
              }
            : undefined,
        };
      },
    );

    return {
      recommendations: mappedRecommendations,
    };
  }

  /**
   * Accept a recommendation
   * - Create interaction record (ACCEPT)
   * - Hide recommendation from UI
   * - Send chat invitation
   */
  async acceptRecommendation(
    details: AcceptRecommendationDetails,
  ): Promise<AcceptRecommendationResults> {
    const { userId, candidateId } = details;

    // Verify both users exist
    const [user, candidate] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: candidateId } }),
    ]);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    // Check if recommendation exists
    const recommendation = await this.prisma.recommendationScore.findUnique({
      where: {
        userId_candidateId: {
          userId,
          candidateId,
        },
      },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    // Check if already accepted
    const existingInteraction =
      await this.prisma.recommendationInteraction.findUnique({
        where: {
          userId_candidateId: {
            userId,
            candidateId,
          },
        },
      });

    if (existingInteraction && existingInteraction.action === 'ACCEPT') {
      throw new BadRequestException('Recommendation already accepted');
    }

    try {
      // Create interaction record and hide recommendation for BOTH users in a transaction
      await this.prisma.$transaction([
        // Record A→E accept
        this.prisma.recommendationInteraction.upsert({
          where: {
            userId_candidateId: {
              userId,
              candidateId,
            },
          },
          update: {
            action: 'ACCEPT',
            createdAt: new Date(),
          },
          create: {
            userId,
            candidateId,
            action: 'ACCEPT',
          },
        }),
        // Hide A→E recommendation
        this.prisma.recommendationScore.update({
          where: {
            userId_candidateId: {
              userId,
              candidateId,
            },
          },
          data: {
            hidden: true,
          },
        }),
        // Also hide E→A recommendation if it exists (reciprocal hiding)
        this.prisma.recommendationScore.updateMany({
          where: {
            userId: candidateId,
            candidateId: userId,
          },
          data: {
            hidden: true,
          },
        }),
      ]);

      // Create a new 1-1 chat (DM) with invitation
      const chatResult = await this.chatsService.createNormalChat({
        creatorId: userId,
        name: '', // Empty name for 1-1 chat
        groupIcon: undefined,
        participantIds: [candidateId], // Only invite the candidate
      });

      return {
        success: true,
        chatId: chatResult.groupChat.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to accept recommendation: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to accept recommendation');
    }
  }

  /**
   * Decline a recommendation
   * - Create interaction record (DECLINE)
   * - Hide recommendation from UI
   * - Will be auto-deleted after 30 days by cleanup job
   */
  async declineRecommendation(
    details: DeclineRecommendationDetails,
  ): Promise<DeclineRecommendationResults> {
    const { userId, candidateId } = details;

    // Verify both users exist
    const [user, candidate] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: candidateId } }),
    ]);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    // Check if recommendation exists
    const recommendation = await this.prisma.recommendationScore.findUnique({
      where: {
        userId_candidateId: {
          userId,
          candidateId,
        },
      },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    try {
      // Create interaction record and hide recommendation in a transaction
      await this.prisma.$transaction([
        this.prisma.recommendationInteraction.upsert({
          where: {
            userId_candidateId: {
              userId,
              candidateId,
            },
          },
          update: {
            action: 'DECLINE',
            createdAt: new Date(),
          },
          create: {
            userId,
            candidateId,
            action: 'DECLINE',
          },
        }),
        this.prisma.recommendationScore.update({
          where: {
            userId_candidateId: {
              userId,
              candidateId,
            },
          },
          data: {
            hidden: true,
          },
        }),
      ]);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to decline recommendation: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to decline recommendation');
    }
  }
}
