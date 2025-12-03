import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}

