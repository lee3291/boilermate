/**
 * Vote (Like/Dislike) DTOs
 * For managing user votes
 */

import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

//* Vote User DTO
export class VoteUserDto {
  @IsString()
  voterId: string;

  @IsString()
  votedUserId: string;

  @IsEnum(['LIKE', 'DISLIKE'])
  voteType: 'LIKE' | 'DISLIKE';
}

//* Remove Vote DTO
export class RemoveVoteDto {
  @IsString()
  voterId: string;

  @IsString()
  votedUserId: string;
}

//* Get My Votes Query DTO
export class GetMyVotesDto {
  @IsString()
  voterId: string;

  @IsOptional()
  @IsEnum(['LIKE', 'DISLIKE'])
  voteType?: 'LIKE' | 'DISLIKE';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

//* Get Vote Stats DTO
export class GetVoteStatsDto {
  @IsString()
  userId: string;
}
