// src/api/saves.ts
import { fetcher } from './listingsFetcher.ts';

/** Save a listing for a username */
export const saveListing = (listingId: string, username: string) =>
    fetcher(`/listings/${listingId}/save`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    }) as Promise<{ listingId: string; username: string; isSaved: true; createdAt: string }>;

/** Unsave a listing for a username */
export const unsaveListing = (listingId: string, username: string) =>
    fetcher(`/listings/${listingId}/save`, {
        method: 'DELETE',
        body: JSON.stringify({ username }),
    }) as Promise<{ listingId: string; username: string; isSaved: false } | null>;

/**
 * Toggle save status. If `shouldSave` is true -> save; otherwise -> unsave.
 * Returns the final saved state (true/false).
 */
export const toggleSave = async (
    listingId: string,
    username: string,
    shouldSave: boolean
): Promise<boolean> => {
    if (shouldSave) {
        await saveListing(listingId, username);
        return true;
    } else {
        await unsaveListing(listingId, username);
        return false;
    }
};

