import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@core/database/prisma.service';
import { UserPreferenceData, MatchResult } from './interfaces';
import * as fs from 'fs';
import * as path from 'path';

/**
 * RecommendationSchedulerService
 * Handles scheduled jobs:
 * 1. Daily matching algorithm (1am) - calculate and store top-20 matches for all users
 * 2. Monthly cleanup (midnight) - delete DECLINE interactions older than 30 days
 */
@Injectable()
export class RecommendationSchedulerService {
  private readonly logger = new Logger(RecommendationSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Daily job: Generate recommendations for all users
   * Runs at 1:00 AM every day
   */
  @Cron('0 1 * * *') // At 01:00
  async generateRecommendations() {
    this.logger.log('Starting daily recommendation generation job...');

    try {
      // Step 1: Delete all existing recommendation scores (fresh start)
      const deleted = await this.prisma.recommendationScore.deleteMany({});
      this.logger.log(`Deleted ${deleted.count} old recommendations`);

      // Step 2: Get all active users with their preferences
      const users = await this.prisma.user.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          profilePreferences: {
            include: {
              preference: {
                select: {
                  id: true,
                  label: true,
                  value: true,
                  category: true,
                },
              },
            },
          },
          roommatePreferences: {
            include: {
              preference: {
                select: {
                  id: true,
                  label: true,
                  value: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Found ${users.length} active users for matching`);

      // Step 3: Generate recommendations for each user
      let totalGenerated = 0;
      const allLogs: string[] = [];
      allLogs.push(`RECOMMENDATION GENERATION RUN`);
      allLogs.push(`Timestamp: ${new Date().toISOString()}`);
      allLogs.push(`Total Active Users: ${users.length}\n`);

      for (const user of users) {
        const { topMatches, logs } = await this.calculateTopMatches(user as any, users as any);
        allLogs.push(...logs);

        if (topMatches.length > 0) {
          await this.prisma.recommendationScore.createMany({
            data: topMatches.map((match) => ({
              userId: user.id,
              candidateId: match.candidateId,
              score: match.score,
              reasons: match.reasons,
            })),
          });
          totalGenerated += topMatches.length;
        }
      }

      // Write all logs to file
      try {
        const logsDir = path.join(process.cwd(), 'recommendation-logs');
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }
        const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.txt`);
        fs.writeFileSync(logFile, allLogs.join('\n'));
        this.logger.log(`Logs written to ${logFile}`);
      } catch (error) {
        this.logger.error(`Failed to write log file: ${error.message}`);
      }

      this.logger.log(
        `Successfully generated ${totalGenerated} recommendations for ${users.length} users`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate recommendations: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Monthly cleanup job: Delete old DECLINE interactions
   * Runs at midnight on the 1st of every month
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldDeclines() {
    this.logger.log('Starting cleanup of old DECLINE interactions...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await this.prisma.recommendationInteraction.deleteMany({
        where: {
          action: 'DECLINE',
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(
        `Successfully deleted ${deleted.count} old DECLINE interactions`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cleanup old declines: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Calculate top matches for a user using two-way scoring algorithm
   * Returns top-20 matches sorted by score and logs
   */
  private async calculateTopMatches(
    user: UserPreferenceData,
    allUsers: UserPreferenceData[],
  ): Promise<{ topMatches: MatchResult[]; logs: string[] }> {
    // Get users this user has already interacted with (exclude from matching)
    const interactions = await this.prisma.recommendationInteraction.findMany({
      where: { userId: user.id },
      select: { candidateId: true },
    });

    // Get users with existing chat relationships (bidirectional)
    // Exclude anyone who is already a participant in a chat with this user
    const existingChats = await this.prisma.chatParticipant.findMany({
      where: {
        userId: user.id,
      },
      select: {
        chatId: true,
      },
    });

    const chatIds = existingChats.map((cp) => cp.chatId);
    const chatParticipants = await this.prisma.chatParticipant.findMany({
      where: {
        chatId: { in: chatIds },
        userId: { not: user.id },
      },
      select: {
        userId: true,
      },
    });

    const excludedIds = new Set([
      user.id, // Exclude self
      ...interactions.map((i) => i.candidateId),
      ...chatParticipants.map((cp) => cp.userId), // Exclude anyone in existing chats
    ]);

    // Calculate scores for all candidates
    const matches: MatchResult[] = [];
    const logLines: string[] = [];
    logLines.push(`\n${'='.repeat(80)}`);
    logLines.push(`SCORING REPORT FOR USER: ${user.email} (ID: ${user.id})`);
    logLines.push(`Timestamp: ${new Date().toISOString()}`);
    logLines.push(`${'='.repeat(80)}\n`);

    for (const candidate of allUsers) {
      // Skip if excluded
      if (excludedIds.has(candidate.id)) {
        continue;
      }

      // Calculate two-way score
      const scoreAtoB = this.calculateCompatibilityScore(user, candidate);
      const scoreBtoA = this.calculateCompatibilityScore(candidate, user);
      const finalScore = (scoreAtoB.score + scoreBtoA.score) / 2;

      // Log every candidate score
      logLines.push(`Candidate: ${candidate.email} (ID: ${candidate.id})`);
      logLines.push(`  Score A->B: ${scoreAtoB.score.toFixed(2)}%`);
      if (scoreAtoB.breakdown.length > 0) {
        scoreAtoB.breakdown.forEach(line => logLines.push(line));
      }
      logLines.push(`  Score B->A: ${scoreBtoA.score.toFixed(2)}%`);
      if (scoreBtoA.breakdown.length > 0) {
        scoreBtoA.breakdown.forEach(line => logLines.push(line));
      }
      logLines.push(`  Final Score: ${finalScore.toFixed(2)}%`);
      logLines.push(`  Top Matches: ${scoreAtoB.reasons.topMatches.join(', ') || 'None'}`);
      logLines.push(`  Status: ${finalScore >= 50 ? 'INCLUDED' : 'BELOW THRESHOLD'}`);
      logLines.push('');

      // Only store if score is above threshold (e.g., 50%)
      if (finalScore >= 50) {
        matches.push({
          candidateId: candidate.id,
          score: finalScore,
          reasons: scoreAtoB.reasons, // Use A->B reasons for display
        });
      }
    }

    // Sort by score descending and take top 20
    const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 20);
    
    // Log summary
    logLines.push(`${'='.repeat(80)}`);
    logLines.push(`SUMMARY`);
    logLines.push(`Total candidates evaluated: ${allUsers.length - excludedIds.size}`);
    logLines.push(`Matches above 50%: ${matches.length}`);
    logLines.push(`Top 20 stored: ${topMatches.length}`);
    logLines.push(`${'='.repeat(80)}\n`);
    
    return { topMatches, logs: logLines };
  }

  /**
   * Calculate compatibility score from userA to userB
   * Compares A's roommatePreferences with B's userProfilePreferences
   */
  private calculateCompatibilityScore(
    userA: UserPreferenceData,
    userB: UserPreferenceData,
  ): { score: number; reasons: { topMatches: string[]; categories: Record<string, boolean> }; breakdown: string[] } {
    // Get A's wants (roommatePreferences) and B's is (profilePreferences)
    const wantsA = userA.roommatePreferences;
    const isB = new Set(
      userB.profilePreferences.map((p) => p.preference.id),
    );

    // Weight tiers for different preference categories
    const weights: Record<string, number> = {
      SMOKING: 10, // Critical dealbreakers
      PET_ALLERGIC: 10,
      CLEANLINESS: 10,
      NOISE: 5, // Major compatibility factors
      GUESTS: 5,
      SLEEP_SCHEDULE: 5,
      DRINKING: 5,
      SOCIAL_STYLE: 2, // Moderate preferences
      COOK_FREQUENCY: 2,
      WORK_LOCATION: 2,
      MUSIC: 2,
      BUDGET: 1, // Minor preferences
      PERSONALITY: 1,
      DIET: 1,
    };

    let totalScore = 0;
    let maxScore = 0;
    const topMatches: string[] = [];
    const categories: Record<string, boolean> = {};
    const breakdown: string[] = [];

    // Calculate weighted score
    for (const want of wantsA) {
      const preferenceId = want.preference.id;
      const category = want.preference.category;
      const label = want.preference.label;
      const importanceLevel = want.importance; // 0-5
      const weight = weights[category] || 1;

      // Calculate weighted importance (base weight * importance level)
      const weightedImportance = weight * (1 + importanceLevel);
      maxScore += weightedImportance;

      // Check if B has this preference
      if (isB.has(preferenceId)) {
        totalScore += weightedImportance;
        categories[category] = true;
        breakdown.push(`    ✓ ${label} (${category}): +${weightedImportance.toFixed(1)} pts [importance=${importanceLevel}, weight=${weight}]`);

        // Add to top matches (limit to 5 most important)
        if (importanceLevel >= 4 && topMatches.length < 5) {
          topMatches.push(label);
        }
      } else if (importanceLevel >= 4) {
        // Heavy penalty for high-importance mismatches
        const penalty = weightedImportance * 0.5;
        totalScore -= penalty;
        breakdown.push(`    ✗ ${label} (${category}): -${penalty.toFixed(1)} pts [PENALTY: importance=${importanceLevel}, weight=${weight}]`);
      } else {
        breakdown.push(`    - ${label} (${category}): 0 pts [no match, importance=${importanceLevel}]`);
      }
    }

    // Calculate percentage score
    const finalScore = maxScore > 0 ? Math.max(0, (totalScore / maxScore) * 100) : 0;

    return {
      score: Math.round(finalScore * 100) / 100, // Round to 2 decimals
      reasons: {
        topMatches,
        categories,
      },
      breakdown,
    };
  }
}
