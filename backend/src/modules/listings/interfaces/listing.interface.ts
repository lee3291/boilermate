export type ListingStatus = 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';

/**
 * What the client sends in the HTTP request body for creating a listing.
 * No auth fields here.
 */
export interface CreateListingBody {
  title: string;
  description: string;
  price: number;        // cents
  location: string;
  mediaUrls: string[];
  status?: ListingStatus;
}

/**
 * What the service actually needs after the controller injects auth context.
 */
export interface CreateListingDetails extends CreateListingBody {
  creatorId: string;
}

/**
 * What a listing looks like when returned to callers (API response shape).
 * Dates as ISO strings match actual JSON output.
 */
export interface ListingResponse {
  id: string;
  creatorId: string;

  title: string;
  description: string;
  price: number;
  location: string;
  mediaUrls: string[];

  status: ListingStatus;
  viewCount: number;

  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}

/** Envelope for the create use case (helps future-proof). */
export interface CreateListingResult {
  listing: ListingResponse;
}
