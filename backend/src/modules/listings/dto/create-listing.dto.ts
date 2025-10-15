export class CreateListingDto {
  title!: string;
  description!: string;
  price!: number;
  location!: string;
  mediaUrls!: string[];
  status?: 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';
}
