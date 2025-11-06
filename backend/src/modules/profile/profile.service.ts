import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new NotFoundException('User not found');
    }

    const {
      id,
      email,
      phoneNumber,
      bio,
      searchStatus,
      preferences,
      avatarURL,
      isVerified,
    } = user;
    const username = email.split('@')[0];

    // If a preference record exists, flatten its JSON content.
    const preference = preferences[0]; // Take the first preference object
    const flatPreferences =
      preference && preference.preferences
        ? Object.entries(
            preference.preferences as { [key: string]: { value: any } },
          ).reduce((acc: { [key: string]: any }, [key, { value }]) => {
            acc[key] = value;
            return acc;
          }, {})
        : {};

    return {
      id,
      username,
      email,
      phoneNumber,
      bio,
      searchStatus,
      avatarURL,
      isVerified,
      ...flatPreferences,
    };
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          startsWith: `${username}@`,
        },
        status: 'ACTIVE',
      },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { id, email, bio, searchStatus, preferences, avatarURL, isVerified } =
      user;

    const preference = preferences[0]; // Take the first preference object
    const flatPreferences =
      preference && preference.preferences
        ? Object.entries(
            preference.preferences as {
              [key: string]: { value: any; visibility: string };
            },
          )
            .filter(([, { visibility }]) => visibility === 'PUBLIC')
            .reduce((acc: { [key: string]: any }, [key, { value }]) => {
              acc[key] = value;
              return acc;
            }, {})
        : {};

    return {
      id,
      username: email.split('@')[0],
      bio,
      searchStatus,
      avatarURL,
      isVerified,
      ...flatPreferences,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const {
      phoneNumber,
      bio,
      searchStatus,
      isSmoker,
      hasPets,
      lifestyleHashtags,
    } = updateProfileDto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Update the direct fields on the User model if they are provided
      const userDataToUpdate: Prisma.UserUpdateInput = {};
      if (phoneNumber !== undefined) userDataToUpdate.phoneNumber = phoneNumber;
      if (bio !== undefined) userDataToUpdate.bio = bio;
      if (searchStatus !== undefined)
        userDataToUpdate.searchStatus = searchStatus;

      if (Object.keys(userDataToUpdate).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userDataToUpdate,
        });
      }

      // 2. Prepare the new preferences data, only including provided fields
      const newPreferencesData: { [key: string]: any } = {};
      if (isSmoker !== undefined) {
        newPreferencesData.isSmoker = { value: isSmoker, visibility: 'PUBLIC' };
      }
      if (hasPets !== undefined) {
        newPreferencesData.hasPets = { value: hasPets, visibility: 'PUBLIC' };
      }
      if (lifestyleHashtags !== undefined) {
        newPreferencesData.lifestyleHashtags = {
          value: lifestyleHashtags,
          visibility: 'PUBLIC',
        };
      }

      // 3. Upsert the Preference record if there's anything to update
      if (Object.keys(newPreferencesData).length > 0) {
        const existingPreference = await prisma.preference.findUnique({
          where: { userId },
        });

        const existingPrefs =
          (existingPreference?.preferences as Prisma.JsonObject) || {};

        // Deep merge for lifestyleHashtags
        if (
          newPreferencesData.lifestyleHashtags &&
          existingPrefs.lifestyleHashtags
        ) {
          const existingHashtags =
            (existingPrefs.lifestyleHashtags as any)?.value || [];
          const newHashtags = newPreferencesData.lifestyleHashtags.value;

          newPreferencesData.lifestyleHashtags.value = [
            ...new Set([...existingHashtags, ...newHashtags]),
          ];
        }

        await prisma.preference.upsert({
          where: { userId },
          create: {
            userId,
            preferences: newPreferencesData,
          },
          update: {
            preferences: {
              ...existingPrefs,
              ...newPreferencesData,
            },
          },
        });
      }

      // 4. Return the fully updated profile
      return this.getProfile(userId);
    });
  }

  async updateAvatar(userId: string, { avatarKey }: UpdateAvatarDto) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_REGION');
    const avatarURL = `https://${bucket}.s3.${region}.amazonaws.com/${avatarKey}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarURL },
    });

    return { avatarURL };
  }

  async deactivateAccount(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });
  }
}
