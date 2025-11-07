import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '../mail/mail.service';
import { AnnouncementDetails } from './interfaces';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

 async createAnnouncement(dto: CreateAnnouncementDto): Promise<AnnouncementDetails> {
  const { title, message, authorId } = dto;

  if (!title || !message) {
    throw new BadRequestException('Title and message are required');
  }

  try {
    // 1️⃣ Create the announcement in the database
    const announcement = await this.prisma.announcement.create({
      data: { title, message, authorId },
    });

    // 2️⃣ Fetch all registered users (with email addresses)
    const users = await this.prisma.user.findMany({
      where: { email: { not: undefined } },
      select: { email: true },
    });

    // 3️⃣ Send announcement emails to all users
    if (users.length > 0) {
      const recipientEmails = users.map((u) => u.email);

      // Log to check
      Logger.log(`Sending announcement to ${recipientEmails.length} users...`);

      await this.mailService.sendBulkEmail(
        recipientEmails,
        `📢 New Announcement: ${title}`,
        message
      );
    } else {
      Logger.warn('No registered users found to send announcement emails.');
    }

    Logger.log(`Created announcement and sent emails to all users`);
    return announcement;
  } catch (error) {
    Logger.error('createAnnouncement error', error);
    throw new InternalServerErrorException('Failed to create announcement');
  }
}

  async getAnnouncements(): Promise<AnnouncementDetails[]> {
    try {
      return await this.prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('getAnnouncements error', error);
      throw new InternalServerErrorException('Failed to fetch announcements');
    }
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto): Promise<AnnouncementDetails> {
    try {
      const existing = await this.prisma.announcement.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Announcement not found');

      return await this.prisma.announcement.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          message: dto.message ?? existing.message,
          isActive: dto.isActive ?? existing.isActive,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('updateAnnouncement error', error);
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      const existing = await this.prisma.announcement.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Announcement not found');

      await this.prisma.announcement.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error('deleteAnnouncement error', error);
      throw new InternalServerErrorException('Failed to delete announcement');
    }
  }
}
