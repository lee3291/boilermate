export class CreateListingDto {
    title!: string;
    user!: string;
    creatorId!: string;
    description!: string;
    price!: number;
    roommates!: number;
    location!: string;
    mediaUrls!: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    moveInStart?: string;
    moveInEnd?: string;
}
