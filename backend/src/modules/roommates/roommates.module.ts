import { Module } from '@nestjs/common';
import { RoommatesController } from './roommates.controller';
import { RoommatesService } from './roommates.service';
import { RoommateReviewsService } from './roommate-reviews.service';
import { PrismaModule } from '@core/database/prisma.module';

/**
 * RoommatesModule
 * Handles roommate requests, relationships, and reviews
 */
@Module({
  imports: [PrismaModule],
  controllers: [RoommatesController],
  providers: [RoommatesService, RoommateReviewsService],
  exports: [RoommatesService, RoommateReviewsService],
})
export class RoommatesModule {}
