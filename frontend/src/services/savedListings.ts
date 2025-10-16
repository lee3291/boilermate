// src/api/savedListings.ts
import { fetcher } from './listingsFetcher.ts';

export type ListingResponse = {
    id: string;
    user: string;
    title: string;
    description: string;
    price: number;
    location: string;
    mediaUrls: string[];
    status: 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';
    viewCount: number;
    moveInStart: string | null;
    moveInEnd: string | null;
    createdAt: string;
    updatedAt: string;
};

export type SavedListingsResult = {
    username: string;
    listings: ListingResponse[];
    page: number;
    pageSize: number;
    total: number;
};

/** Get listings a user has saved (paginated) */
export const getSavedListings = (
    username: string,
    page = 1,
    pageSize = 20
) =>
    fetcher(
        `/listings/users/${encodeURIComponent(username)}/saved?page=${page}&pageSize=${pageSize}`
    ) as Promise<SavedListingsResult>;

