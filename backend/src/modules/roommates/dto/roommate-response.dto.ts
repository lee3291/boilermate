/**
 * Response DTOs for roommate requests and relationships
 */

/**
 * User details in responses
 */
export class RoommateUserResponseDto {
  id: string;
  email: string;
  avatarURL?: string;

  static fromUser(user: any): RoommateUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      avatarURL: user.avatarURL,
    };
  }
}

/**
 * Roommate request response
 */
export class RoommateRequestResponseDto {
  id: string;
  requesterId: string;
  requestedId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  requester?: RoommateUserResponseDto;
  requested?: RoommateUserResponseDto;

  static fromRequest(request: any): RoommateRequestResponseDto {
    return {
      id: request.id,
      requesterId: request.requesterId,
      requestedId: request.requestedId,
      status: request.status,
      message: request.message,
      startDate: request.startDate,
      endDate: request.endDate,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      requester: request.requester ? RoommateUserResponseDto.fromUser(request.requester) : undefined,
      requested: request.requested ? RoommateUserResponseDto.fromUser(request.requested) : undefined,
    };
  }
}

/**
 * List of roommate requests response
 */
export class RoommateRequestsResponseDto {
  requests: RoommateRequestResponseDto[];

  static fromRequests(requests: any[]): RoommateRequestsResponseDto {
    return {
      requests: requests.map(r => RoommateRequestResponseDto.fromRequest(r)),
    };
  }
}

/**
 * Roommate relationship response
 */
export class RoommateResponseDto {
  id: string;
  user1Id: string;
  user2Id: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  user1?: RoommateUserResponseDto;
  user2?: RoommateUserResponseDto;

  static fromRoommate(roommate: any): RoommateResponseDto {
    return {
      id: roommate.id,
      user1Id: roommate.user1Id,
      user2Id: roommate.user2Id,
      startDate: roommate.startDate,
      endDate: roommate.endDate,
      isActive: roommate.isActive,
      createdAt: roommate.createdAt,
      user1: roommate.user1 ? RoommateUserResponseDto.fromUser(roommate.user1) : undefined,
      user2: roommate.user2 ? RoommateUserResponseDto.fromUser(roommate.user2) : undefined,
    };
  }
}

/**
 * List of roommates response
 */
export class RoommatesResponseDto {
  roommates: RoommateResponseDto[];

  static fromRoommates(roommates: any[]): RoommatesResponseDto {
    return {
      roommates: roommates.map(r => RoommateResponseDto.fromRoommate(r)),
    };
  }
}

/**
 * Accept request response (returns both request and roommate)
 */
export class AcceptRoommateRequestResponseDto {
  request: RoommateRequestResponseDto;
  roommate: RoommateResponseDto;

  static fromAcceptance(request: any, roommate: any): AcceptRoommateRequestResponseDto {
    return {
      request: RoommateRequestResponseDto.fromRequest(request),
      roommate: RoommateResponseDto.fromRoommate(roommate),
    };
  }
}

/**
 * Search users response
 */
export class SearchUsersResponseDto {
  users: RoommateUserResponseDto[];

  static fromUsers(users: any[]): SearchUsersResponseDto {
    return {
      users: users.map(u => RoommateUserResponseDto.fromUser(u)),
    };
  }
}

/**
 * Generic success response
 */
export class SuccessResponseDto {
  success: boolean;
  message?: string;

  static create(message?: string): SuccessResponseDto {
    return {
      success: true,
      message,
    };
  }
}
