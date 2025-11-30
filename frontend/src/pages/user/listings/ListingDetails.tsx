// This component has been updated to support viewing listings via a direct URL.
// Previously, it only worked when navigating from a listing card, as it depended
// on data passed through `react-router`'s location state.
//
// The component now has a more robust data loading strategy. It first checks for
// location state for a quick render. If that's not available, it uses the listing
// ID from the URL to fetch the data directly from the API. This makes the page
// shareable and accessible via direct links.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../../../contexts/AuthContext';
import ShareButtons from './components/ShareButtons';
import { getListingById } from '../../../services/listings';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function ListingDetails() {
  const { user: authUser } = useAuth();
  // Retrieve the listing ID from the URL. This allows the component to be
  // self-sufficient and fetch its own data.
  const { id: listingId } = useParams<{ id: string }>();

  // Use location state passed from the previous page (e.g., a listing card).
  // This is an optimization to avoid a network request when data is already available.
  const { state: locationState } = useLocation() as {
    state?: {
      id: string;
      title: string;
      author: string;
      price: string;
      body: string;
      location: string;
      moveInStart: string;
      moveInEnd: string;
      roommate?: string;
    };
  };

  // Holds the listing data. Initialized with location state if available.
  const [listing, setListing] = useState(locationState);
  // Manages loading state, active when fetching data from the API.
  const [loading, setLoading] = useState(!locationState);
  // Holds any potential error messages from the data fetching process.
  const [error, setError] = useState<string | null>(null);

  const viewerUsername = useMemo(() => {
    if (!authUser) return null;
    const maybeUsername =
      (authUser as any).username ?? (authUser as any).displayName;
    if (typeof maybeUsername === 'string' && maybeUsername.trim())
      return maybeUsername.trim();
    if (
      typeof (authUser as any).email === 'string' &&
      (authUser as any).email.includes('@')
    ) {
      return (authUser as any).email.split('@')[0].trim();
    }
    if ((authUser as any).id) return String((authUser as any).id);
    return null;
  }, [authUser]);

  // Determines if the currently logged-in user is the owner of the listing.
  const isOwner = useMemo(() => {
    if (!listing) return false;
    const a = String(listing.author || '')
      .trim()
      .toLowerCase();
    const v = String(viewerUsername || '')
      .trim()
      .toLowerCase();
    return !!a && !!v && a === v;
  }, [listing, viewerUsername]);

  const [viewCount, setViewCount] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState<number | null>(null);
  const postedRef = useRef(false);

  // This effect handles the data fetching logic. If the component doesn't have
  // listing data from the location state, it uses the ID from the URL to
  // fetch it from the API.
  useEffect(() => {
    // Only fetch if we don't have a listing and there's an ID in the URL.
    if (!listing && listingId) {
      setLoading(true);
      getListingById(listingId)
        .then((data) => {
          // On success, populate the listing state with the fetched data.
          setListing(data);
        })
        .catch((err) => {
          // If the fetch fails, store an error message.
          setError(err.message || 'Failed to fetch listing details.');
        })
        .finally(() => {
          // Ensure loading is set to false after the operation completes.
          setLoading(false);
        });
    } else if (listing) {
      // If we already have a listing, just ensure loading is false.
      setLoading(false);
    }
  }, [listing, listingId]);

  // This effect tracks a view for the listing. It runs only after the `listing`
  // state has been populated, ensuring it has an ID to work with.
  useEffect(() => {
    if (!listing || postedRef.current) return;
    postedRef.current = true;

    const viewerKey = viewerUsername ?? 'anon';
    const key = `viewed:${listing.id}:${viewerKey}`;

    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, '1');

    const body = viewerUsername ? { username: viewerUsername } : {};
    fetch(`${API_BASE}/listings/${listing.id}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, [listing, viewerUsername]);

  // Fetches view counts for the listing owner.
  useEffect(() => {
    if (!isOwner || !listing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/listings/${listing.id}/views/counts`,
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setViewCount(json.viewCount ?? 0);
          setUniqueCount(json.uniqueCount ?? 0);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [isOwner, listing]);

  // Display a loading message while data is being fetched.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Display an error message if the API call fails.
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Display a "not found" message if the listing can't be loaded.
  if (!listing) {
    return <div>Listing not found.</div>;
  }

  // Once all checks pass, we can safely destructure the listing data for rendering.
  const { title, author, price, body, id, location, moveInStart, moveInEnd } =
    listing;

  return (
    <div className='h-400 w-full'>
      <Navbar />

      <div className='pt-10 pl-18'>
        <div className='flex justify-between'>
          <h1 className='font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-[-0.02em]'>
            {title}
          </h1>

          <div className='-mt-5 mr-20 flex justify-baseline gap-3'>
            {/* Only show Apply / Contact if viewer is not the owner (mirrors card behavior) */}
            {!isOwner && (
              <>
                <button className='font-roboto-light mt-10 h-12 w-35 cursor-pointer rounded-4xl bg-black text-white'>
                  Apply to join
                </button>
                <button className='font-roboto-light mt-10 h-12 w-30 cursor-pointer rounded-4xl border border-black bg-white text-black'>
                  Contact
                </button>
              </>
            )}

            <ShareButtons
              id={id}
              title={title}
              author={author}
              price={price}
              body={body}
              location={location}
              moveInStart={moveInStart}
              moveInEnd={moveInEnd}
            />
          </div>
        </div>

        <div className='mr-22 flex justify-end'>
          <a
            href='/listings'
            className='font-roboto-light hover:underline hover:underline-offset-2'
          >
            Return to Listings
          </a>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex gap-10'>
            <p className='font-roboto-italic text-[20px] tracking-[-0.02em] text-gray-500'>
              Created by {author}
            </p>
            <p className='font-sourceserif4-18pt-italic -mt-px text-[20px] text-gray-400'>
              {price}
            </p>
          </div>

          {isOwner && (
            <div className='font-roboto-italic text-sm text-[20px] text-gray-500'>
              Views: {viewCount ?? '—'}
              {typeof uniqueCount === 'number'
                ? ` (${uniqueCount} unique)`
                : ''}
            </div>
          )}
        </div>

        <p className='font-roboto-italic text-[20px] text-gray-600'>
          Location: {location}
        </p>
        <p className='font-roboto-italic text-[20px] text-gray-600'>
          Move in Date: {moveInStart} - {moveInEnd}
        </p>

        <h2 className='font-sourceserif4-18pt-regular text-maingray mt-10 text-[40px] tracking-[-0.02em]'>
          Description
        </h2>
        <p className='font-roboto-light mt-1 text-[20px] tracking-[-0.02em]'>
          {body}
        </p>

        <p className='font-roboto-light mt-6 text-sm text-gray-400'>
          Listing ID: {id}
        </p>
      </div>
    </div>
  );
}
