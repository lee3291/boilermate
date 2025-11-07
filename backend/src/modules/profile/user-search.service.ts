import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class UserSearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search for a user by Purdue ID (email prefix)
   * Only returns ACTIVE users with searchStatus not HIDDEN
   */
  async searchUserByID(emailPrefix: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { startsWith: emailPrefix + '@purdue.edu' },
        status: 'ACTIVE',
        searchStatus: { not: 'HIDDEN' },
      },
    });
    if (!user) {
      throw new NotFoundException('No active user found with that Purdue ID');
    }
    return user;
  }
}
