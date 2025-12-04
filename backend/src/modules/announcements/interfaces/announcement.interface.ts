
export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date | null;
  isActive: boolean;
  likes: number;
}
