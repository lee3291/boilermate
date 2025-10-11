export interface Listing {
    listingID: string;
    userID: string;
    title: string;
    description: string;
    pricing: number;
    media: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    viewCount: number;
    createdAt: Date;
}