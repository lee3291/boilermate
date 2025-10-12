export interface Listing {
    listingID: string;
    userID: string;
    title: string;
    description: string;
    pricing: number;
    //media: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    numberBed : number;
    numberBath : number;
    viewCount: number;
    createdAt: Date;
}