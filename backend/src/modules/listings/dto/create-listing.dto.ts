export class CreateListingDto {
  title!: string;
  description!: string;
  price!: number;
  location!: string;
  mediaUrls!: string[];
  creatorId?: string;
  status?: 'ACTIVE' | 'PAUSED'  | 'REMOVED';
}
