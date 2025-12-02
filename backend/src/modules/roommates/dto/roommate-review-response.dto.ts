/**
 * Roommate Review Response DTOs
 */

export class ReviewerResponseDto {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;

  static fromUser(user: any): ReviewerResponseDto {
    return {
      id: user.id,
      email: user.email,
      legalName: user.legalName,
      avatarURL: user.avatarURL,
    };
  }
}

export class RoommateInfoDto {
  id: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;

  static fromRoommate(roommate: any): RoommateInfoDto {
    return {
      id: roommate.id,
      startDate: roommate.startDate,
      endDate: roommate.endDate,
      isActive: roommate.isActive,
    };
  }
}

export class RoommateReviewResponseDto {
  id: string;
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: ReviewerResponseDto;
  reviewed?: ReviewerResponseDto;
  roommate?: RoommateInfoDto;

  static fromReview(review: any): RoommateReviewResponseDto {
    return {
      id: review.id,
      reviewerId: review.reviewerId,
      reviewedId: review.reviewedId,
      roommateId: review.roommateId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: review.reviewer ? ReviewerResponseDto.fromUser(review.reviewer) : undefined,
      reviewed: review.reviewed ? ReviewerResponseDto.fromUser(review.reviewed) : undefined,
      roommate: review.roommate ? RoommateInfoDto.fromRoommate(review.roommate) : undefined,
    };
  }
}

export class ReviewsResponseDto {
  reviews: RoommateReviewResponseDto[];

  static fromReviews(reviews: any[]): ReviewsResponseDto {
    return {
      reviews: reviews.map(r => RoommateReviewResponseDto.fromReview(r)),
    };
  }
}

export class DeleteReviewResponseDto {
  success: boolean;

  static fromSuccess(success: boolean): DeleteReviewResponseDto {
    return { success };
  }
}

export class EligibleRoommateDto {
  id: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;

  static fromRoommate(roommate: any): EligibleRoommateDto {
    return {
      id: roommate.id,
      startDate: roommate.startDate,
      endDate: roommate.endDate,
      isActive: roommate.isActive,
    };
  }
}

export class EligibleRoommatesForReviewResponseDto {
  eligibleRoommates: EligibleRoommateDto[];

  static fromEligibleRoommates(roommates: any[]): EligibleRoommatesForReviewResponseDto {
    return {
      eligibleRoommates: roommates.map(r => EligibleRoommateDto.fromRoommate(r)),
    };
  }
}
