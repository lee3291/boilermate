export interface Listing {
    listingID: string;
    userID: string;
    title: string;
    description: string;
    pricing: number;
    location: string;
    media: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    viewCount: number;
    createdAt: Date;
}