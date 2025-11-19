import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import {
  SendRoommateRequestDetails,
  SendRoommateRequestResults,
  GetRoommateRequestsDetails,
  GetRoommateRequestsResults,
  AcceptRoommateRequestDetails,
  AcceptRoommateRequestResults,
  RejectRoommateRequestDetails,
  RejectRoommateRequestResults,
  WithdrawRoommateRequestDetails,
  WithdrawRoommateRequestResults,
  GetRoommatesDetails,
  GetRoommatesResults,
  EndRoommateRelationshipDetails,
  EndRoommateRelationshipResults,
  SearchUsersDetails,
  SearchUsersResults,
  RoommateRequestDetails,
  RoommateDetails,
  RoommateUserDetails,
} from './interfaces';

/**
 * RoommatesService
 * Handles roommate requests, relationships, and user search
 * Works with interfaces, not DTOs
 */
@Injectable()
export class RoommatesService {
  private readonly logger = new Logger(RoommatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a roommate request
   * Validates that users exist, no existing relationship, and no pending request
   */
  async sendRoommateRequest(details: SendRoommateRequestDetails): Promise<SendRoommateRequestResults> {
    const { requesterId, requestedId, message } = details;

    // Validate users are different
    if (requesterId === requestedId) {
      throw new BadRequestException('Cannot send roommate request to yourself');
    }

    // Validate both users exist
    const [requester, requested] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: requesterId } }),
      this.prisma.user.findUnique({ where: { id: requestedId } }),
    ]);

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }
    if (!requested) {
      throw new NotFoundException('Requested user not found');
    }

    // Check if there's an existing pending request in either direction
    const existingPendingRequest = await this.prisma.roommateRequest.findFirst({
      where: {
        OR: [
          { requesterId, requestedId, status: 'PENDING' },
          { requesterId: requestedId, requestedId: requesterId, status: 'PENDING' },
        ],
      },
    });

    if (existingPendingRequest) {
      throw new BadRequestException('A pending request already exists between you two');
    }

    // Check if they're already roommates
    const existingRoommate = await this.prisma.roommate.findFirst({
      where: {
        OR: [
          { user1Id: requesterId, user2Id: requestedId, isActive: true },
          { user1Id: requestedId, user2Id: requesterId, isActive: true },
        ],
      },
    });

    if (existingRoommate) {
      throw new BadRequestException('You are already roommates');
    }

    // Check for recent rejection (within 30 days) - prevent spam
    const recentRejection = await this.prisma.roommateRequest.findFirst({
      where: {
        requesterId,
        requestedId,
        status: 'REJECTED',
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    if (recentRejection) {
      const daysSinceRejection = Math.floor(
        (Date.now() - recentRejection.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      throw new BadRequestException(
        `This user rejected your request recently. Please wait ${30 - daysSinceRejection} more days.`
      );
    }

    // Create the request
    const request = await this.prisma.roommateRequest.create({
      data: {
        requesterId,
        requestedId,
        message,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        requested: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
    });

    this.logger.log(`Roommate request sent from ${requesterId} to ${requestedId}`);

    return {
      request: this.mapRequestToDetails(request),
    };
  }

  /**
   * Get roommate requests for a user
   * Can filter by type (sent/received/all) and status
   */
  async getRoommateRequests(details: GetRoommateRequestsDetails): Promise<GetRoommateRequestsResults> {
    const { userId, type = 'all', status } = details;

    // Build where clause based on filters
    const whereConditions: any = {};

    // Filter by type
    if (type === 'sent') {
      whereConditions.requesterId = userId;
    } else if (type === 'received') {
      whereConditions.requestedId = userId;
    } else {
      // type === 'all'
      whereConditions.OR = [
        { requesterId: userId },
        { requestedId: userId },
      ];
    }

    // Filter by status if provided
    if (status) {
      whereConditions.status = status;
    }

    const requests = await this.prisma.roommateRequest.findMany({
      where: whereConditions,
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        requested: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      requests: requests.map((r: any) => this.mapRequestToDetails(r)),
    };
  }

  /**
   * Accept a roommate request
   * Creates a Roommate relationship and updates request status
   */
  async acceptRoommateRequest(details: AcceptRoommateRequestDetails): Promise<AcceptRoommateRequestResults> {
    const { requestId, userId } = details;

    // Find the request
    const request = await this.prisma.roommateRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        requested: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Validate that userId is the requested user
    if (request.requestedId !== userId) {
      throw new ForbiddenException('You can only accept requests sent to you');
    }

    // Validate request is still pending
    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
    }

    // Use transaction to update request and create roommate relationship
    const [updatedRequest, roommate] = await this.prisma.$transaction([
      // Update request status
      this.prisma.roommateRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              avatarURL: true,
            },
          },
          requested: {
            select: {
              id: true,
              email: true,
              avatarURL: true,
            },
          },
        },
      }),

      // Create roommate relationship
      this.prisma.roommate.create({
        data: {
          user1Id: request.requesterId,
          user2Id: request.requestedId,
          isActive: true,
        },
        include: {
          user1: {
            select: {
              id: true,
              email: true,
              avatarURL: true,
            },
          },
          user2: {
            select: {
              id: true,
              email: true,
              avatarURL: true,
            },
          },
        },
      }),
    ]);

    this.logger.log(`Roommate request ${requestId} accepted, relationship created`);

    return {
      request: this.mapRequestToDetails(updatedRequest),
      roommate: this.mapRoommateToDetails(roommate),
    };
  }

  /**
   * Reject a roommate request
   * Marks request as REJECTED (immutable)
   */
  async rejectRoommateRequest(details: RejectRoommateRequestDetails): Promise<RejectRoommateRequestResults> {
    const { requestId, userId } = details;

    // Find the request
    const request = await this.prisma.roommateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Validate that userId is the requested user
    if (request.requestedId !== userId) {
      throw new ForbiddenException('You can only reject requests sent to you');
    }

    // Validate request is still pending
    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
    }

    // Update request status to REJECTED
    const updatedRequest = await this.prisma.roommateRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        requested: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
    });

    this.logger.log(`Roommate request ${requestId} rejected`);

    return {
      request: this.mapRequestToDetails(updatedRequest),
    };
  }

  /**
   * Withdraw a pending roommate request
   * Only the requester can withdraw, and only if status is PENDING
   */
  async withdrawRoommateRequest(details: WithdrawRoommateRequestDetails): Promise<WithdrawRoommateRequestResults> {
    const { requestId, userId } = details;

    // Find the request
    const request = await this.prisma.roommateRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Validate that userId is the requester
    if (request.requesterId !== userId) {
      throw new ForbiddenException('You can only withdraw your own requests');
    }

    // Validate request is still pending
    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Cannot withdraw ${request.status.toLowerCase()} request`);
    }

    // Delete the request
    await this.prisma.roommateRequest.delete({
      where: { id: requestId },
    });

    this.logger.log(`Roommate request ${requestId} withdrawn by ${userId}`);

    return {
      success: true,
    };
  }

  /**
   * Get all roommates for a user
   * Can filter to only active roommates
   */
  async getRoommates(details: GetRoommatesDetails): Promise<GetRoommatesResults> {
    const { userId, activeOnly = true } = details;

    // Build where clause
    const whereConditions: any = {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    };

    if (activeOnly) {
      whereConditions.isActive = true;
    }

    const roommates = await this.prisma.roommate.findMany({
      where: whereConditions,
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return {
      roommates: roommates.map((r: any) => this.mapRoommateToDetails(r)),
    };
  }

  /**
   * End a roommate relationship
   * Either user can initiate ending the relationship
   */
  async endRoommateRelationship(details: EndRoommateRelationshipDetails): Promise<EndRoommateRelationshipResults> {
    const { roommateId, userId } = details;

    // Find the roommate relationship
    const roommate = await this.prisma.roommate.findUnique({
      where: { id: roommateId },
    });

    if (!roommate) {
      throw new NotFoundException('Roommate relationship not found');
    }

    // Validate that userId is one of the users in the relationship
    if (roommate.user1Id !== userId && roommate.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this roommate relationship');
    }

    // Validate relationship is still active
    if (!roommate.isActive) {
      throw new BadRequestException('Roommate relationship is already ended');
    }

    // Update roommate relationship to inactive
    const updatedRoommate = await this.prisma.roommate.update({
      where: { id: roommateId },
      data: {
        isActive: false,
        endDate: new Date(),
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            avatarURL: true,
          },
        },
      },
    });

    this.logger.log(`Roommate relationship ${roommateId} ended by ${userId}`);

    return {
      roommate: this.mapRoommateToDetails(updatedRoommate),
    };
  }

  /**
   * Search for users to send roommate requests
   * Excludes existing roommates and pending requests if specified
   */
  async searchUsers(details: SearchUsersDetails): Promise<SearchUsersResults> {
    const { userId, query = '', excludeRoommates = true, excludePendingRequests = true } = details;

    // Build where clause for user search
    const whereConditions: any = {
      id: { not: userId }, // Exclude self
    };

    // Search by email
    if (query) {
      whereConditions.email = { contains: query, mode: 'insensitive' };
    }

    // Get all users matching search
    let users = await this.prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        avatarURL: true,
      },
      take: 50, // Limit results
    });

    // Exclude existing roommates if requested
    if (excludeRoommates) {
      const existingRoommates = await this.prisma.roommate.findMany({
        where: {
          OR: [
            { user1Id: userId, isActive: true },
            { user2Id: userId, isActive: true },
          ],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      });

      const roommateIds = new Set(
        existingRoommates.flatMap((r: any) => [r.user1Id, r.user2Id]).filter((id: string) => id !== userId)
      );

      users = users.filter(u => !roommateIds.has(u.id));
    }

    // Exclude users with pending requests if requested
    if (excludePendingRequests) {
      const pendingRequests = await this.prisma.roommateRequest.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'PENDING' },
            { requestedId: userId, status: 'PENDING' },
          ],
        },
        select: {
          requesterId: true,
          requestedId: true,
        },
      });

      const pendingUserIds = new Set(
        pendingRequests.flatMap((r: any) => [r.requesterId, r.requestedId]).filter((id: string) => id !== userId)
      );

      users = users.filter(u => !pendingUserIds.has(u.id));
    }

    return {
      users: users.map((u: any) => this.mapUserToDetails(u)),
    };
  }

  // ============= Helper Methods =============

  /**
   * Map database request to interface
   */
  private mapRequestToDetails(request: any): RoommateRequestDetails {
    return {
      id: request.id,
      requesterId: request.requesterId,
      requestedId: request.requestedId,
      status: request.status,
      message: request.message,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      requester: request.requester ? this.mapUserToDetails(request.requester) : undefined,
      requested: request.requested ? this.mapUserToDetails(request.requested) : undefined,
    };
  }

  /**
   * Map database roommate to interface
   */
  private mapRoommateToDetails(roommate: any): RoommateDetails {
    return {
      id: roommate.id,
      user1Id: roommate.user1Id,
      user2Id: roommate.user2Id,
      startDate: roommate.startDate,
      endDate: roommate.endDate,
      isActive: roommate.isActive,
      createdAt: roommate.createdAt,
      user1: roommate.user1 ? this.mapUserToDetails(roommate.user1) : undefined,
      user2: roommate.user2 ? this.mapUserToDetails(roommate.user2) : undefined,
    };
  }

  /**
   * Map database user to interface
   */
  private mapUserToDetails(user: any): RoommateUserDetails {
    return {
      id: user.id,
      email: user.email,
      avatarURL: user.avatarURL,
    };
  }
}
