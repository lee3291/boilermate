/**
 * Vote Response DTOs
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileSummaryDto } from './profile-summary.response.dto';

//* Vote Response DTO
@Exclude()
export class VoteResponseDto {
  @Expose() message: string;
  @Expose() voteId: string;
  @Expose() voteType: 'LIKE' | 'DISLIKE';
}

//* Vote Stats DTO
@Exclude()
export class VoteStatsDto {
  @Expose() userId: string;
  @Expose() likesReceived: number;
  @Expose() dislikesReceived: number;
  @Expose() totalVotes: number;

  static fromStats(userId: string, likesReceived: number, dislikesReceived: number): VoteStatsDto {
    const dto = new VoteStatsDto();
    dto.userId = userId;
    dto.likesReceived = likesReceived;
    dto.dislikesReceived = dislikesReceived;
    dto.totalVotes = likesReceived + dislikesReceived;
    return dto;
  }
}

//* Get My Votes Response DTO
@Exclude()
export class GetMyVotesResponseDto {
  @Expose()
  @Type(() => ProfileSummaryDto)
  votes: ProfileSummaryDto[];
  
  @Expose() voteType?: 'LIKE' | 'DISLIKE';
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  static fromVotes(
    votes: any[], 
    total: number, 
    page: number, 
    limit: number,
    voteType?: 'LIKE' | 'DISLIKE'
  ): GetMyVotesResponseDto {
    const dto = new GetMyVotesResponseDto();
    dto.votes = votes;
    dto.voteType = voteType;
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}
