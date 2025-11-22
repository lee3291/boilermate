import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import {
  GetReviewsDetails,
  GetReviewsResults,
  AddReviewDetails,
  AddReviewResults,
  UpdateReviewDetails,
  UpdateReviewResults,
  DeleteReviewDetails,
  DeleteReviewResults,
  RoommateReviewDetails,
  RoommateUserDetails,
} from './interfaces';

/**
 * RoommateReviewsService
 * Handles roommate reviews - only roommates can review each other
 */
@Injectable()
export class RoommateReviewsService {
  private readonly logger = new Logger(RoommateReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all reviews for a user
   * Can optionally filter by specific roommate relationship
   */
  async getReviews(details: GetReviewsDetails): Promise<GetReviewsResults> {
    const { reviewedId, roommateId } = details;

    const whereConditions: any = {
      reviewedId,
    };

    if (roommateId) {
      whereConditions.roommateId = roommateId;
    }

    const reviews = await this.prisma.roommateReview.findMany({
      where: whereConditions,
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        reviewed: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        roommate: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      reviews: reviews.map((r: any) => this.mapReviewToDetails(r)),
    };
  }

  /**
   * Add a review
   * Validates that reviewer and reviewed were roommates
   */
  async addReview(details: AddReviewDetails): Promise<AddReviewResults> {
    const { reviewerId, reviewedId, roommateId, rating, comment } = details;

    // Validate users are different
    if (reviewerId === reviewedId) {
      throw new BadRequestException('Cannot review yourself');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Validate roommate relationship exists
    const roommate = await this.prisma.roommate.findUnique({
      where: { id: roommateId },
    });

    if (!roommate) {
      throw new NotFoundException('Roommate relationship not found');
    }

    // Validate that reviewer is part of this roommate relationship
    if (roommate.user1Id !== reviewerId && roommate.user2Id !== reviewerId) {
      throw new ForbiddenException('You are not part of this roommate relationship');
    }

    // Validate that reviewedId is the other person in the relationship
    const expectedReviewedId = roommate.user1Id === reviewerId ? roommate.user2Id : roommate.user1Id;
    if (reviewedId !== expectedReviewedId) {
      throw new BadRequestException('Invalid reviewed user for this roommate relationship');
    }

    // Check if review already exists
    const existingReview = await this.prisma.roommateReview.findUnique({
      where: {
        reviewerId_reviewedId_roommateId: {
          reviewerId,
          reviewedId,
          roommateId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this roommate for this relationship');
    }

    // Create review
    const review = await this.prisma.roommateReview.create({
      data: {
        reviewerId,
        reviewedId,
        roommateId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        reviewed: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        roommate: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.log(`Review added by ${reviewerId} for ${reviewedId}`);

    return {
      review: this.mapReviewToDetails(review),
    };
  }

  /**
   * Update a review
   * Only the reviewer can update their own review
   */
  async updateReview(details: UpdateReviewDetails): Promise<UpdateReviewResults> {
    const { reviewId, reviewerId, rating, comment } = details;

    // Find the review
    const review = await this.prisma.roommateReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Validate that the user is the reviewer
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Build update data
    const updateData: any = {};
    if (rating !== undefined) {
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    // Update review
    const updatedReview = await this.prisma.roommateReview.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        reviewed: {
          select: {
            id: true,
            email: true,
            legalName: true,
            avatarURL: true,
          },
        },
        roommate: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.log(`Review ${reviewId} updated by ${reviewerId}`);

    return {
      review: this.mapReviewToDetails(updatedReview),
    };
  }

  /**
   * Delete a review
   * Only the reviewer can delete their own review
   */
  async deleteReview(details: DeleteReviewDetails): Promise<DeleteReviewResults> {
    const { reviewId, reviewerId } = details;

    // Find the review
    const review = await this.prisma.roommateReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Validate that the user is the reviewer
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete review
    await this.prisma.roommateReview.delete({
      where: { id: reviewId },
    });

    this.logger.log(`Review ${reviewId} deleted by ${reviewerId}`);

    return {
      success: true,
    };
  }

  // ============= Helper Methods =============

  /**
   * Map database review to interface
   */
  private mapReviewToDetails(review: any): RoommateReviewDetails {
    return {
      id: review.id,
      reviewerId: review.reviewerId,
      reviewedId: review.reviewedId,
      roommateId: review.roommateId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: review.reviewer ? this.mapReviewerToDetails(review.reviewer) : undefined,
      reviewed: review.reviewed ? this.mapReviewerToDetails(review.reviewed) : undefined,
      roommate: review.roommate ? {
        id: review.roommate.id,
        startDate: review.roommate.startDate,
        endDate: review.roommate.endDate,
        isActive: review.roommate.isActive,
      } : undefined,
    };
  }

  /**
   * Map database user to reviewer details
   */
  private mapReviewerToDetails(user: any): RoommateUserDetails {
    return {
      id: user.id,
      email: user.email,
      legalName: user.legalName,
      avatarURL: user.avatarURL,
    };
  }
}
