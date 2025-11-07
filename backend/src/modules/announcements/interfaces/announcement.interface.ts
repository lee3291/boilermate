export interface AnnouncementDetails {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  authorId?: string | null; 
  isActive: boolean;
}


