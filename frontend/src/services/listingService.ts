const BASE_URL = 'http://localhost:3000/listing';

export async function createListing(data: any) {
  const response = await fetch(`${BASE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create listing');
  }

  return response.json();
}

/**
 * Fetches the details for a single listing by its ID.
 * @param listingId The unique identifier of the listing to fetch.
 * @returns The listing data.
 */
export async function getListingById(listingId: string) {
  const response = await fetch(`${BASE_URL}/${listingId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch listing details');
  }

  return response.json();
}
