export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/**
 * What the client sends in the HTTP request body for creating a listing.
 * No auth fields here.
 */
export interface CreateListingBody {
  title: string;
  user: string;
  description: string;
  price: number;        // cents
  location: string;
  roommates: number;
  mediaUrls: string[];
  status?: ListingStatus;
  moveInStart?: string;
  moveInEnd?: string;
  moveInDateOutdatedAlert?: boolean;
  reportedOutdatedAlert?: boolean;
}

/**
 * What the service actually needs after the controller injects auth context.
 */
export interface CreateListingDetails extends CreateListingBody {
  // creatorId: string;
}

/**
 * What a listing looks like when returned to callers (API response shape).
 * Dates as ISO strings match actual JSON output.
 */
export interface ListingResponse {
  id: string;
  // creatorId: string;

  user: string;
  title: string;
  description: string;
  price: number;
  location: string;
  roommates: number;
  mediaUrls: string[];

  status: ListingStatus;
  viewCount: number;

  moveInStart: string | null; // "YYYY-MM-DD"
  moveInEnd: string | null;   // "YYYY-MM-DD"
  moveInDateOutdatedAlert: boolean;
  reportedOutdatedAlert: boolean;

  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}

/** Envelope for the create use case (helps future-proof). */
export interface CreateListingResult {
  listing: ListingResponse;
}

export interface SaveListingBody {
  username: string;
}

/** Result of a save action */
export interface SaveListingResult {
  listingId: string;
  username: string;
  isSaved: true;
  createdAt: string;
}

/** Result of an unsave action */
export interface UnsaveListingResult {
  listingId: string;
  username: string;
  isSaved: false;
}

/** Count of saves for a listing */
export interface SaveCountResult {
  listingId: string;
  count: number;
}

/** Who saved a listing (usernames only) */
export interface SavedByResult {
  listingId: string;
  usernames: string[];
  page: number;
  pageSize: number;
  total: number; // total rows
}

/** Listings saved by a specific user */
export interface SavedListingsResult {
  username: string;
  listings: ListingResponse[];
  page: number;
  pageSize: number;
  total: number; // total rows matching
}

export interface Listing {
    listingID: string;
    userID: string;
    title: string;
    description: string;
    pricing: number;
    roommates: number;
    location: string;
    media: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    viewCount: number;
    moveInDateOutdatedAlert: boolean;
    reportedOutdatedAlert: boolean;
    createdAt: Date;
}

