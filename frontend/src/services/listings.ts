import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export type ListingStatus = 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';

export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;        // cents
  location: string;
  mediaUrls: string[];
  status?: ListingStatus;
  creatorId?: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingResult {
  listing: ListingResponse;
}

// Minimal create call
export async function createListing(payload: CreateListingPayload): Promise<CreateListingResult> {
  try {
    const res = await api.post('/listings', payload);
    // Backend (as we set it up) returns: { listing: {...} }
    return res.data as CreateListingResult;
  } catch (err: any) {
    // bubble up server error shape (e.g., validation errors)
    throw err?.response?.data ?? err;
  }
}

export default { createListing };

