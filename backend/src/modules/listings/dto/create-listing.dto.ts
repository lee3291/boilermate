export class CreateListingDto {
    title!: string;
    user!: string;
    creatorId!: string;
    description!: string;
    price!: number;
    location!: string;
    mediaUrls!: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: string;
    moveInEnd?: string;
}
