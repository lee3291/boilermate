import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phoneNumber: true,
        bio: true,
        searchStatus: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email, ...rest } = user;
    const name = email.split('@')[0];

    // Combine the derived name with the rest of the profile data
    return { name, email, ...rest };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const { lifestyleHashtags, isSmoker, hasPets, ...restOfDto } =
      updateProfileDto;

    // Start a transaction to update the user and their preferences
    return this.prisma.$transaction(async (prisma) => {
      // 1. Update the core User model fields
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...restOfDto,
        },
      });

      // 2. Handle preferences (key-value pairs)
      if (lifestyleHashtags !== undefined) {
        await prisma.preference.upsert({
          where: { userId_key: { userId, key: 'lifestyleHashtags' } },
          update: { value: lifestyleHashtags },
          create: {
            userId,
            key: 'lifestyleHashtags',
            value: lifestyleHashtags,
          },
        });
      }
      if (isSmoker !== undefined) {
        await prisma.preference.upsert({
          where: { userId_key: { userId, key: 'isSmoker' } },
          update: { value: String(isSmoker) },
          create: { userId, key: 'isSmoker', value: String(isSmoker) },
        });
      }
      if (hasPets !== undefined) {
        await prisma.preference.upsert({
          where: { userId_key: { userId, key: 'hasPets' } },
          update: { value: String(hasPets) },
          create: { userId, key: 'hasPets', value: String(hasPets) },
        });
      }

      return updatedUser;
    });
  }
}
