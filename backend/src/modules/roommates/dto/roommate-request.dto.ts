import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

/**
 * DTO for sending a roommate request
 */
export class SendRoommateRequestDto {
  @IsString()
  requesterId: string;

  @IsString()
  requestedId: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * DTO for getting roommate requests
 */
export class GetRoommateRequestsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(['sent', 'received', 'all'])
  type?: 'sent' | 'received' | 'all';

  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED'])
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

/**
 * DTO for accepting a roommate request
 */
export class AcceptRoommateRequestDto {
  @IsString()
  requestId: string;

  @IsString()
  userId: string;
}

/**
 * DTO for rejecting a roommate request
 */
export class RejectRoommateRequestDto {
  @IsString()
  requestId: string;

  @IsString()
  userId: string;
}

/**
 * DTO for withdrawing a roommate request
 */
export class WithdrawRoommateRequestDto {
  @IsString()
  requestId: string;

  @IsString()
  userId: string;
}

/**
 * DTO for getting roommates
 */
export class GetRoommatesDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

/**
 * DTO for ending a roommate relationship
 */
export class EndRoommateRelationshipDto {
  @IsString()
  roommateId: string;

  @IsString()
  userId: string;
}

/**
 * DTO for searching users
 */
export class SearchUsersDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsBoolean()
  excludeRoommates?: boolean;

  @IsOptional()
  @IsBoolean()
  excludePendingRequests?: boolean;
}
