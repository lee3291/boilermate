import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import { getSavedListings } from '../../../services/savedListings';
import { useAuth } from '../../../contexts/AuthContext';
import ListingComparison, { type ListingForCompare } from './ListingComparison';

type Listing = {
    id: string;
    title: string;
    user: string;
    description?: string;
    price: number;
    location: string;
    moveInStart: string | null;
    moveInEnd: string | null;
};

const PAGE_SIZE = 20;

export default function SavedListings() {
    const { user: authUser, loading: authLoading } = useAuth();

    const [listings, setListings] = useState<Listing[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
        [total],
    );

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showComparison, setShowComparison] = useState(false);

    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const selectedListings: ListingForCompare[] = useMemo(
        () => listings.filter((l) => selectedIds.has(l.id)),
        [listings, selectedIds],
    );

    const listingUser = useMemo(() => {
        if (!authUser) return null;
        const maybeUsername = (authUser as any).username ?? (authUser as any).displayName;
        if (typeof maybeUsername === 'string' && maybeUsername.trim()) return maybeUsername.trim();
        if (typeof (authUser as any).email === 'string' && (authUser as any).email.includes('@')) {
            return (authUser as any).email.split('@')[0].trim();
        }
        if ((authUser as any).id) return String((authUser as any).id);
        return null;
    }, [authUser]);

    useEffect(() => {
        if (!listingUser) return;

        const ac = new AbortController();
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getSavedListings(listingUser, page, PAGE_SIZE);
                if (ac.signal.aborted) return;
                setListings(res.listings);
                setTotal(res.total);

                clearSelection();
            } catch (e: any) {
                if (ac.signal.aborted) return;
                setError(e?.message ?? 'Failed to load saved listings');
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [listingUser, page]);


    if (authLoading) {
        return (
            <div className='w-full'>
                <Navbar />
                <div className='p-6 text-gray-600'>Checking authentication…</div>
            </div>
        );
    }

    if (!listingUser) {
        return (
            <div className='w-full'>
                <Navbar />
                <div className='p-6 text-gray-600'>
                    Please sign in to view your saved listings.
                </div>
            </div>
        );
    }

    return (
        <div className='w-full'>
            <Navbar />

            <div className='px-20 pt-6'>
                <div className='flex items-start justify-between gap-4'>
                    <div>
                        <h1 className='font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-[-0.02em]'>
                            Saved Listings
                        </h1>

                        <p className='font-roboto-light pb-5 text-gray-600'>
                            Total saved listings: {total ? ` ${total}` : ''}
                        </p>
                    </div>

                    <div className='font-roboto-light mt-7 flex items-center gap-3'>
                        <a
                            className='hover:underline hover:underline-offset-2'
                            href='/listings'
                        >
                            Return to Listings
                        </a>

                        <div className='flex items-center gap-2'>
                            <button
                                className='cursor-pointer rounded border px-3 py-1 text-sm transition hover:bg-black hover:text-white disabled:opacity-50'
                                disabled={selectedIds.size < 2}
                                onClick={() => setShowComparison(true)}
                                title={
                                    selectedIds.size < 2
                                        ? 'Select at least two to compare'
                                        : 'Open comparison'
                                }
                            >
                                Compare ({selectedIds.size})
                            </button>
                            {selectedIds.size > 0 && (
                                <button
                                    className='cursor-pointer rounded border px-3 py-1 text-sm transition hover:bg-black hover:text-white'
                                    onClick={clearSelection}
                                    title='Clear selected'
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading && <div className='p-4'>Loading saved listings…</div>}

                {!loading && error && (
                    <div className='rounded border border-red-200 p-4 text-red-600'>
                        {error}
                    </div>
                )}

                {!loading && !error && listings.length === 0 && (
                    <div className='p-4 text-gray-600'>
                        You haven’t saved any listings yet.
                    </div>
                )}

                {!loading && !error && listings.length > 0 && (
                    <>
                        <ul className='space-y-3'>
                            {listings.map((l) => {
                                const formattedPrice = Intl.NumberFormat(undefined, {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(l.price / 100);

                                const checked = selectedIds.has(l.id);

                                return (
                                    <li key={l.id} className='rounded-lg border p-4'>
                                        <div className='flex items-start justify-between gap-4'>
                                            <label className='mt-1 flex items-start gap-2'>
                                                <input
                                                    type='checkbox'
                                                    className='mt-1 h-4 w-4 cursor-pointer accent-gray-700'
                                                    checked={checked}
                                                    onChange={() => toggleSelected(l.id)}
                                                    aria-label={`Select ${l.title} for comparison`}
                                                    />
                                            </label>

                                            <div className='min-w-0 flex-1'>
                                                <Link
                                                    to={`/listings/${l.id}`}
                                                    state={{
                                                        id: l.id,
                                                        title: l.title,
                                                        author: l.user,
                                                        price: formattedPrice,
                                                        body: l.description ?? '',
                                                        location: l.location,
                                                        moveInStart: l.moveInStart ?? '—',
                                                        moveInEnd: l.moveInEnd ?? '—',
                                                    }}
                                                    className='font-sourceserif4-18pt-regular text-xl break-words hover:underline'
                                                >
                                                    {l.title}
                                                </Link>
                                                <div className='font-roboto-regular truncate text-sm text-gray-400'>
                                                    by {l.user} • {l.location}
                                                </div>
                                            </div>

                                            <div className='font-roboto-light shrink-0 text-sm text-gray-700'>
                                                {formattedPrice}
                                            </div>
                                        </div>

                                        {l.description ? (
                                            <p className='font-roboto-light mt-2 line-clamp-2 text-gray-700'>
                                                {l.description}
                                            </p>
                                        ) : null}

                                        <div className='mt-2 text-xs text-gray-500'>
                                            {l.moveInStart ?? '—'} → {l.moveInEnd ?? '—'}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Pagination */}
                        <div className='flex items-center gap-2 pt-5'>
                            <button
                                className='rounded border px-3 py-1 disabled:opacity-50'
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>
                            <span className='text-sm'>
                                Page {page} / {totalPages}
                            </span>
                            <button
                                className='rounded border px-3 py-1 disabled:opacity-50'
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showComparison && (
                <ListingComparison
                    listings={selectedListings}
                    onClose={() => setShowComparison(false)}
                    />
            )}
        </div>
    );
}

