import {
 Injectable,
 NotFoundException,
 InternalServerErrorException,
 BadRequestException,
 Logger,
} from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { AnnouncementDetails } from './interfaces';

import {
 CreateAnnouncementDto,
 UpdateAnnouncementDto,
} from './dto';


@Injectable()
export class AnnouncementsService {
 constructor(private readonly prisma: PrismaService) {}


 async createAnnouncement(dto: CreateAnnouncementDto): Promise<AnnouncementDetails> {
   const { title, message, authorId } = dto;


   if (!title || !message)
     throw new BadRequestException('Title and message are required');


   try {
     return await this.prisma.announcement.create({
       data: { title, message, authorId },
     });
   } catch (error) {
     Logger.error('createAnnouncement error', error);
     throw new InternalServerErrorException('Failed to create announcement');
   }
 }


async getAnnouncements(): Promise<AnnouncementDetails[]> {
  try {
    const announcements = await this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return announcements;
  } catch (error) {
    Logger.error('getAnnouncements error', error);
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
     Logger.error('updateAnnouncement error', error);
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
     Logger.error('deleteAnnouncement error', error);
     throw new InternalServerErrorException('Failed to delete announcement');
   }
 }
}


