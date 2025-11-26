/**
 * Roommate Review Types
 */

export interface RoommateReviewer {
  id: string;
  email: string;
  legalName?: string;
  avatarURL?: string;
}

export interface RoommateReview {
  id: string;
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: RoommateReviewer;
  reviewed?: RoommateReviewer;
  roommate?: {
    id: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
  };
}

// API Request/Response types
export interface GetReviewsRequest {
  reviewedId: string;
  roommateId?: string;
}

export interface GetReviewsResponse {
  reviews: RoommateReview[];
}

export interface AddReviewRequest {
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
}

export interface AddReviewResponse {
  id: string;
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: RoommateReviewer;
  reviewed?: RoommateReviewer;
}

export interface UpdateReviewRequest {
  reviewerId: string;
  rating?: number;
  comment?: string;
}

export interface UpdateReviewResponse {
  id: string;
  reviewerId: string;
  reviewedId: string;
  roommateId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: RoommateReviewer;
  reviewed?: RoommateReviewer;
}

export interface DeleteReviewRequest {
  reviewerId: string;
}

export interface DeleteReviewResponse {
  success: boolean;
}
