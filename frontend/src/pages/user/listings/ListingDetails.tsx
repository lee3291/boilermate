import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useParams
import Navbar from '../components/Navbar';
import { useAuth } from '../../../contexts/AuthContext';
import ShareButtons from './components/ShareButtons';
import { getListingById } from '../../../services/listingService'; // Import the service function

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Define a type for the listing data for better type safety
type ListingData = {
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

export default function ListingDetails() {
  const { user: authUser } = useAuth();
  const { state: navState } = useLocation() as { state?: ListingData };
  const { id: idFromUrl } = useParams<{ id: string }>(); // Get listing ID from URL

  // Component state to hold listing data, loading status, and errors
  const [listing, setListing] = useState<ListingData | null>(navState || null);
  const [loading, setLoading] = useState(!navState); // Start loading if no data from navigation
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState<number | null>(null);
  const postedRef = useRef(false);

  const listingId = idFromUrl || listing?.id;

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

  // --- Data Fetching Logic ---
  // This effect runs if the component is loaded directly via a URL (e.g., from an email link),
  // causing the navigation state to be empty. It fetches the data from the backend
  // using the listing ID from the URL.
  useEffect(() => {
    if (!listing && listingId) {
      setLoading(true);
      getListingById(listingId)
        .then((data) => {
          // The API returns the listing object directly.
          setListing(data);
          setError(null);
        })
        .catch((err) => {
          console.error('Failed to fetch listing:', err);
          setError(err.message || 'Could not load listing details.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [listing, listingId]);

  // Effect for tracking views
  useEffect(() => {
    if (!listing?.id || postedRef.current) return;
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
  }, [listing?.id, viewerUsername]);

  // If owner, fetch counts for display
  useEffect(() => {
    if (!isOwner || !listing?.id) return;
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
  }, [isOwner, listing?.id]);

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className='h-400 w-full'>
        <Navbar />
        <div className='pt-20 text-center'>Loading listing details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-400 w-full'>
        <Navbar />
        <div className='pt-20 text-center text-red-500'>Error: {error}</div>
      </div>
    );
  }

  if (!listing) {
    // This message is shown if no listing could be found at all.
    return (
      <div className='h-400 w-full'>
        <Navbar />
        <div className='pt-20 text-center'>Listing not found.</div>
      </div>
    );
  }

  // Destructure data from the listing state object
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
            <button className='font-roboto-light mt-10 h-12 w-35 cursor-pointer rounded-4xl bg-black text-white'>
              Apply to join
            </button>
            <button className='font-roboto-light mt-10 h-12 w-30 cursor-pointer rounded-4xl border border-black bg-white text-black'>
              Contact
            </button>

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
