import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { 
  GetUserProfilePreferencesDetails,
  SetUserProfilePreferenceDetails,
  DeleteUserProfilePreferenceDetails,
  GetRoommatePreferencesDetails,
  SetRoommatePreferenceDetails,
  DeleteRoommatePreferenceDetails,
  GetPreferencesResults,
  UserProfilePreferenceDetails,
  RoommatePreferenceDetails
} from './interfaces/preference.interface';
import { PrismaService } from '@core/database/prisma.service';

/**
 * PreferencesService
 * - Handles user profile preferences (I am...)
 * - Handles roommate preferences (I want...)
 * - Manages importance and visibility settings
 */

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available preferences (master list)
   */
  async getPreferences(): Promise<GetPreferencesResults> {
    const client: any = this.prisma as any;

    try {
      const preferences = await client.preference.findMany({
        orderBy: [
          { category: 'asc' },
          { label: 'asc' }
        ]
      });

      return { preferences };
    } catch (error) {
      this.logger.error('Failed to get preferences', error);
      throw error;
    }
  }

  /**
   * Get user profile preferences (I am...)
   */
  async getUserProfilePreferences(details: GetUserProfilePreferencesDetails): Promise<UserProfilePreferenceDetails[]> {
    const client: any = this.prisma as any;
    const { userId } = details;

    //! NULL CHECK: Validate userId
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      //! NULL CHECK: Verify user exists
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const preferences = await client.userProfilePreference.findMany({
        where: { userId },
        include: {
          preference: true
        },
        orderBy: {
          importance: 'desc'
        }
      });

      return preferences;
    } catch (error) {
      this.logger.error('Failed to get user profile preferences', error);
      throw error;
    }
  }

  /**
   * Set/Update user profile preference (I am...)
   */
  async setUserProfilePreference(details: SetUserProfilePreferenceDetails): Promise<UserProfilePreferenceDetails> {
    const client: any = this.prisma as any;
    const { userId, preferenceId, importance, visibility } = details;

    //! NULL CHECK: Validate required fields
    if (!userId || !preferenceId) {
      throw new BadRequestException('userId and preferenceId are required');
    }

    //! NULL CHECK: Validate importance range
    if (importance !== undefined && (importance < 1 || importance > 5)) {
      throw new BadRequestException('importance must be between 1 and 5');
    }

    try {
      //! NULL CHECK: Verify user exists
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      //! NULL CHECK: Verify preference exists
      const preference = await client.preference.findUnique({
        where: { id: preferenceId }
      });

      if (!preference) {
        throw new NotFoundException('Preference not found');
      }

      // Upsert: Create or update
      const userProfilePreference = await client.userProfilePreference.upsert({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        },
        update: {
          importance: importance ?? undefined,
          visibility: visibility ?? undefined
        },
        create: {
          userId,
          preferenceId,
          importance: importance ?? 3, // Default importance
          visibility: visibility ?? 'PUBLIC' // Default visibility
        },
        include: {
          preference: true
        }
      });

      return userProfilePreference;
    } catch (error) {
      this.logger.error('Failed to set user profile preference', error);
      throw error;
    }
  }

  /**
   * Delete user profile preference (I am...)
   */
  async deleteUserProfilePreference(details: DeleteUserProfilePreferenceDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId, preferenceId } = details;

    //! NULL CHECK: Validate required fields
    if (!userId || !preferenceId) {
      throw new BadRequestException('userId and preferenceId are required');
    }

    try {
      //! NULL CHECK: Verify preference exists before deleting
      const existing = await client.userProfilePreference.findUnique({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        }
      });

      if (!existing) {
        throw new NotFoundException('User profile preference not found');
      }

      await client.userProfilePreference.delete({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to delete user profile preference', error);
      throw error;
    }
  }

  /**
   * Get roommate preferences (I want...)
   */
  async getRoommatePreferences(details: GetRoommatePreferencesDetails): Promise<RoommatePreferenceDetails[]> {
    const client: any = this.prisma as any;
    const { userId } = details;

    //! NULL CHECK: Validate userId
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      //! NULL CHECK: Verify user exists
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const preferences = await client.roommatePreference.findMany({
        where: { userId },
        include: {
          preference: true
        },
        orderBy: {
          importance: 'desc'
        }
      });

      return preferences;
    } catch (error) {
      this.logger.error('Failed to get roommate preferences', error);
      throw error;
    }
  }

  /**
   * Set/Update roommate preference (I want...)
   */
  async setRoommatePreference(details: SetRoommatePreferenceDetails): Promise<RoommatePreferenceDetails> {
    const client: any = this.prisma as any;
    const { userId, preferenceId, importance, visibility } = details;

    //! NULL CHECK: Validate required fields
    if (!userId || !preferenceId) {
      throw new BadRequestException('userId and preferenceId are required');
    }

    //! NULL CHECK: Validate importance range
    if (importance !== undefined && (importance < 1 || importance > 5)) {
      throw new BadRequestException('importance must be between 1 and 5');
    }

    try {
      //! NULL CHECK: Verify user exists
      const user = await client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      //! NULL CHECK: Verify preference exists
      const preference = await client.preference.findUnique({
        where: { id: preferenceId }
      });

      if (!preference) {
        throw new NotFoundException('Preference not found');
      }

      // Upsert: Create or update
      const roommatePreference = await client.roommatePreference.upsert({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        },
        update: {
          importance: importance ?? undefined,
          visibility: visibility ?? undefined
        },
        create: {
          userId,
          preferenceId,
          importance: importance ?? 3, // Default importance
          visibility: visibility ?? 'PUBLIC' // Default visibility
        },
        include: {
          preference: true
        }
      });

      return roommatePreference;
    } catch (error) {
      this.logger.error('Failed to set roommate preference', error);
      throw error;
    }
  }

  /**
   * Delete roommate preference (I want...)
   */
  async deleteRoommatePreference(details: DeleteRoommatePreferenceDetails): Promise<void> {
    const client: any = this.prisma as any;
    const { userId, preferenceId } = details;

    //! NULL CHECK: Validate required fields
    if (!userId || !preferenceId) {
      throw new BadRequestException('userId and preferenceId are required');
    }

    try {
      //! NULL CHECK: Verify preference exists before deleting
      const existing = await client.roommatePreference.findUnique({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        }
      });

      if (!existing) {
        throw new NotFoundException('Roommate preference not found');
      }

      await client.roommatePreference.delete({
        where: {
          userId_preferenceId: {
            userId,
            preferenceId
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to delete roommate preference', error);
      throw error;
    }
  }
}
