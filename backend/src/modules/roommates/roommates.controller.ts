import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, Query } from '@nestjs/common';
import { RoommatesService } from './roommates.service';
import { RoommateReviewsService } from './roommate-reviews.service';
import {
  SendRoommateRequestDto,
  GetRoommateRequestsDto,
  AcceptRoommateRequestDto,
  RejectRoommateRequestDto,
  WithdrawRoommateRequestDto,
  GetRoommatesDto,
  EndRoommateRelationshipDto,
  SearchUsersDto,
  RoommateRequestResponseDto,
  RoommateRequestsResponseDto,
  AcceptRoommateRequestResponseDto,
  RoommatesResponseDto,
  RoommateResponseDto,
  SearchUsersResponseDto,
  SuccessResponseDto,
  GetReviewsDto,
  AddReviewDto,
  UpdateReviewDto,
  DeleteReviewDto,
  ReviewsResponseDto,
  RoommateReviewResponseDto,
  DeleteReviewResponseDto,
  EligibleRoommatesForReviewResponseDto,
} from './dto';

/**
 * Roommates Controller
 * Handles HTTP requests for roommate relationships and reviews
 * Converts between DTOs and service interfaces
 */
@Controller('roommates')
export class RoommatesController {
  private readonly logger = new Logger(RoommatesController.name);

  constructor(
    private readonly roommatesService: RoommatesService,
    private readonly roommateReviewsService: RoommateReviewsService,
  ) {}

  /**
   * Send a roommate request
   * POST /roommates/requests
   */
  @Post('requests')
  @HttpCode(201)
  async sendRoommateRequest(@Body() dto: SendRoommateRequestDto): Promise<RoommateRequestResponseDto> {
    this.logger.log(`Sending roommate request from ${dto.requesterId} to ${dto.requestedId}`);

    const result = await this.roommatesService.sendRoommateRequest({
      requesterId: dto.requesterId,
      requestedId: dto.requestedId,
      message: dto.message,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    return RoommateRequestResponseDto.fromRequest(result.request);
  }

  /**
   * Get roommate requests for a user
   * GET /roommates/requests?userId=xxx&type=sent&status=PENDING
   */
  @Get('requests')
  @HttpCode(200)
  async getRoommateRequests(@Query() dto: GetRoommateRequestsDto): Promise<RoommateRequestsResponseDto> {
    this.logger.log(`Getting roommate requests for user ${dto.userId}`);

    const result = await this.roommatesService.getRoommateRequests({
      userId: dto.userId,
      type: dto.type,
      status: dto.status,
    });

    return RoommateRequestsResponseDto.fromRequests(result.requests);
  }

  /**
   * Accept a roommate request
   * POST /roommates/requests/:requestId/accept
   */
  @Post('requests/:requestId/accept')
  @HttpCode(200)
  async acceptRoommateRequest(
    @Param('requestId') requestId: string,
    @Body() dto: AcceptRoommateRequestDto,
  ): Promise<AcceptRoommateRequestResponseDto> {
    this.logger.log(`Accepting roommate request ${requestId} by user ${dto.userId}`);

    const result = await this.roommatesService.acceptRoommateRequest({
      requestId,
      userId: dto.userId,
    });

    return AcceptRoommateRequestResponseDto.fromAcceptance(result.request, result.roommate);
  }

  /**
   * Reject a roommate request
   * POST /roommates/requests/:requestId/reject
   */
  @Post('requests/:requestId/reject')
  @HttpCode(200)
  async rejectRoommateRequest(
    @Param('requestId') requestId: string,
    @Body() dto: RejectRoommateRequestDto,
  ): Promise<RoommateRequestResponseDto> {
    this.logger.log(`Rejecting roommate request ${requestId} by user ${dto.userId}`);

    const result = await this.roommatesService.rejectRoommateRequest({
      requestId,
      userId: dto.userId,
    });

    return RoommateRequestResponseDto.fromRequest(result.request);
  }

  /**
   * Withdraw a pending roommate request
   * DELETE /roommates/requests/:requestId
   */
  @Delete('requests/:requestId')
  @HttpCode(200)
  async withdrawRoommateRequest(
    @Param('requestId') requestId: string,
    @Query() dto: WithdrawRoommateRequestDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`Withdrawing roommate request ${requestId} by user ${dto.userId}`);

    await this.roommatesService.withdrawRoommateRequest({
      requestId,
      userId: dto.userId,
    });

    return SuccessResponseDto.create('Request withdrawn successfully');
  }

  /**
   * Get all roommates for a user
   * GET /roommates?userId=xxx&activeOnly=true
   */
  @Get()
  @HttpCode(200)
  async getRoommates(@Query() dto: GetRoommatesDto): Promise<RoommatesResponseDto> {
    this.logger.log(`Getting roommates for user ${dto.userId}, activeOnly: ${dto.activeOnly}`);

    // Convert string 'false' to boolean false (query params come as strings)
    const activeOnly = dto.activeOnly === undefined ? true : String(dto.activeOnly) === 'true';

    const result = await this.roommatesService.getRoommates({
      userId: dto.userId,
      activeOnly,
    });

    return RoommatesResponseDto.fromRoommates(result.roommates);
  }

  /**
   * End a roommate relationship
   * DELETE /roommates/:roommateId
   */
  @Delete(':roommateId')
  @HttpCode(200)
  async endRoommateRelationship(
    @Param('roommateId') roommateId: string,
    @Query() dto: EndRoommateRelationshipDto,
  ): Promise<RoommateResponseDto> {
    this.logger.log(`Ending roommate relationship ${roommateId} by user ${dto.userId}`);

    const result = await this.roommatesService.endRoommateRelationship({
      roommateId,
      userId: dto.userId,
    });

    return RoommateResponseDto.fromRoommate(result.roommate);
  }

  /**
   * Search for users to send roommate requests
   * GET /roommates/users/search?userId=xxx&query=john&excludeRoommates=true
   */
  @Get('users/search')
  @HttpCode(200)
  async searchUsers(@Query() dto: SearchUsersDto): Promise<SearchUsersResponseDto> {
    this.logger.log(`Searching users for user ${dto.userId} with query: ${dto.query}`);

    const result = await this.roommatesService.searchUsers({
      userId: dto.userId,
      query: dto.query,
      excludeRoommates: dto.excludeRoommates,
      excludePendingRequests: dto.excludePendingRequests,
    });

    return SearchUsersResponseDto.fromUsers(result.users);
  }

  // ============= Review Endpoints =============

  /**
   * Get all reviews for a user
   * GET /roommates/reviews?reviewedId=xxx&roommateId=xxx
   */
  @Get('reviews')
  @HttpCode(200)
  async getReviews(@Query() dto: GetReviewsDto): Promise<ReviewsResponseDto> {
    this.logger.log(`Getting reviews for user ${dto.reviewedId}`);

    const result = await this.roommateReviewsService.getReviews({
      reviewedId: dto.reviewedId,
      roommateId: dto.roommateId,
    });

    return ReviewsResponseDto.fromReviews(result.reviews);
  }

  /**
   * Get eligible roommate periods for review
   * GET /roommates/reviews/eligible?reviewerId=xxx&reviewedId=xxx
   */
  @Get('reviews/eligible')
  @HttpCode(200)
  async getEligibleRoommatesForReview(
    @Query('reviewerId') reviewerId: string,
    @Query('reviewedId') reviewedId: string,
  ): Promise<EligibleRoommatesForReviewResponseDto> {
    this.logger.log(`Getting eligible roommates for review from ${reviewerId} for ${reviewedId}`);

    const result = await this.roommateReviewsService.getEligibleRoommatesForReview({
      reviewerId,
      reviewedId,
    });

    return EligibleRoommatesForReviewResponseDto.fromEligibleRoommates(
      result.eligibleRoommates,
    );
  }

  /**
   * Add a review
   * POST /roommates/reviews
   */
  @Post('reviews')
  @HttpCode(201)
  async addReview(@Body() dto: AddReviewDto): Promise<RoommateReviewResponseDto> {
    this.logger.log(`Adding review from ${dto.reviewerId} for ${dto.reviewedId}`);

    const result = await this.roommateReviewsService.addReview({
      reviewerId: dto.reviewerId,
      reviewedId: dto.reviewedId,
      roommateId: dto.roommateId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return RoommateReviewResponseDto.fromReview(result.review);
  }

  /**
   * Update a review
   * PUT /roommates/reviews/:reviewId
   */
  @Put('reviews/:reviewId')
  @HttpCode(200)
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<RoommateReviewResponseDto> {
    this.logger.log(`Updating review ${reviewId} by ${dto.reviewerId}`);

    const result = await this.roommateReviewsService.updateReview({
      reviewId,
      reviewerId: dto.reviewerId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return RoommateReviewResponseDto.fromReview(result.review);
  }

  /**
   * Delete a review
   * DELETE /roommates/reviews/:reviewId?reviewerId=xxx
   */
  @Delete('reviews/:reviewId')
  @HttpCode(200)
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Query() dto: DeleteReviewDto,
  ): Promise<DeleteReviewResponseDto> {
    this.logger.log(`Deleting review ${reviewId} by ${dto.reviewerId}`);

    const result = await this.roommateReviewsService.deleteReview({
      reviewId,
      reviewerId: dto.reviewerId,
    });

    return DeleteReviewResponseDto.fromSuccess(result.success);
  }
}
