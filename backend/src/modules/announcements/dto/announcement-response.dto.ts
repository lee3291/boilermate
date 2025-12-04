import { Announcement } from '../interfaces/announcement.interface';


export class AnnouncementResponseDto implements Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date; 
  isActive: boolean;
  scheduledAt?: Date | null;
  likes: number;
}
