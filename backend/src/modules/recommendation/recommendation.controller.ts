import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Logger,
  Param,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationSchedulerService } from './recommendation-scheduler.service';
import {
  GetRecommendationsDto,
  AcceptRecommendationDto,
  DeclineRecommendationDto,
  RecommendationsResponseDto,
  AcceptRecommendationResponseDto,
  DeclineRecommendationResponseDto,
} from './dto';

/**
 * Recommendation Controller
 * Handles HTTP requests for roommate recommendations
 * Converts between DTOs and service interfaces
 */
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly recommendationSchedulerService: RecommendationSchedulerService,
  ) {}

  /**
   * Get top recommendations for a user
   * GET /recommendations/:userId
   */
  @Get(':userId')
  async getRecommendations(
    @Param('userId') userId: string,
  ): Promise<RecommendationsResponseDto> {
    this.logger.log(`Getting recommendations for user: ${userId}`);

    const result = await this.recommendationService.getRecommendations({
      userId,
    });

    return RecommendationsResponseDto.fromRecommendations(result.recommendations);
  }

  /**
   * Accept a recommendation (send invitation)
   * POST /recommendations/accept
   */
  @Post('accept')
  @HttpCode(200)
  async acceptRecommendation(
    @Body() dto: AcceptRecommendationDto,
  ): Promise<AcceptRecommendationResponseDto> {
    this.logger.log(
      `User ${dto.userId} accepting recommendation for ${dto.candidateId}`,
    );

    const result = await this.recommendationService.acceptRecommendation({
      userId: dto.userId,
      candidateId: dto.candidateId,
    });

    return AcceptRecommendationResponseDto.fromAccept(
      result.success,
      result.chatId,
    );
  }

  /**
   * Decline a recommendation
   * POST /recommendations/decline
   */
  @Post('decline')
  @HttpCode(200)
  async declineRecommendation(
    @Body() dto: DeclineRecommendationDto,
  ): Promise<DeclineRecommendationResponseDto> {
    this.logger.log(
      `User ${dto.userId} declining recommendation for ${dto.candidateId}`,
    );

    const result = await this.recommendationService.declineRecommendation({
      userId: dto.userId,
      candidateId: dto.candidateId,
    });

    return DeclineRecommendationResponseDto.fromDecline(result.success);
  }

  /**
   * Manually trigger recommendation generation (for testing)
   * POST /recommendations/generate-now
   */
  @Post('generate-now')
  async generateNow() {
    await this.recommendationSchedulerService.generateRecommendations();
    return { success: true };
  }
}
