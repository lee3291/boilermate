import { fetcher } from './listingsFetcher';

export const getListingById = (id: string) => {
  return fetcher(`/listings/${id}`);
};
