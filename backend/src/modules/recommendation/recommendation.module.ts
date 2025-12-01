import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationSchedulerService } from './recommendation-scheduler.service';
import { PrismaModule } from '@core/database/prisma.module';
import { ChatsModule } from '../chats/chats.module';

/**
 * RecommendationModule
 * Handles roommate recommendation system:
 * - Daily scoring algorithm (1am)
 * - Top recommendations API
 * - Accept/decline interactions
 * - Monthly cleanup of old declines
 */
@Module({
  imports: [
    PrismaModule,
    ChatsModule, // For sending invitations
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationSchedulerService],
  exports: [RecommendationService, RecommendationSchedulerService],
})
export class RecommendationModule {}
