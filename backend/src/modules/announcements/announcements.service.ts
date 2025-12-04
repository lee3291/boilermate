import { Injectable } from '@nestjs/common';
import { Announcement } from './interfaces/announcement.interface';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { v4 as uuid } from 'uuid';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AnnouncementsService {
 
private announcements: Announcement[] = [];
  mailService: any;
  logger: any;


findAll(): Announcement[] {
return this.announcements;
}


findById(id: string): Announcement | undefined {
return this.announcements.find((a) => a.id === id);
}


create(dto: CreateAnnouncementDto): Announcement {
  const announcement: Announcement = {
    id: uuid(),
    title: dto.title.trim(),
    message: dto.message.trim(),
    createdAt: new Date(),
    updatedAt: new Date(), 
    isActive: true,
    scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null, 
    likes: 0,
  };

  this.announcements.unshift(announcement);
  return announcement;
}



update(id: string, dto: UpdateAnnouncementDto): Announcement | null {
  const idx = this.announcements.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const existing = this.announcements[idx];

  this.announcements[idx] = {
    ...existing,
    ...dto,
    scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    updatedAt: new Date(),
  };

  return this.announcements[idx];
}




delete(id: string): boolean {
const prevLen = this.announcements.length;
this.announcements = this.announcements.filter((a) => a.id !== id);
return this.announcements.length < prevLen;
}


like(id: string): Announcement | null {
const announcement = this.findById(id);
if (!announcement) return null;
announcement.likes++;
return announcement;
}


private async sendTopLikedEmail(to: string) {
  try {
    const topAnnouncements = this.announcements
      .filter(a => a.isActive)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    if (topAnnouncements.length === 0) {
      this.logger.warn(`No announcements to send.`);
      return;
    }

    const summary = topAnnouncements
      .map((a, i) => `${i + 1}. ${a.title} (${a.likes} likes)\n${a.message}`)
      .join('\n\n');

    await this.mailService.sendEmail(
      to,
      'Top 5 Most Liked Announcements',
      summary,
    );
    this.logger.log(`Sent top 5 announcements email to: ${to}`);
  } catch (error) {
    this.logger.warn(`Failed to email ${to}: ${error.message}`);
  }
}



async sendTopLikedToAllUsers(): Promise<void> {
  const userIds = ['user1', 'bijang', 'admin']; 
  for (const userId of userIds) {
    const email = `${userId}@purdue.edu`;
    await this.sendTopLikedEmail(email);
  }
}



}

