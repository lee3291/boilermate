import { useEffect, useState } from 'react';
import { getSavedListings } from '../../../services/savedListings';
import { useUser } from './temp/UserContext';
import { Link } from 'react-router-dom';

type Listing = {
    id: string;
    title: string;
    user: string;
    description: string;
    price: number;
    location: string;
    moveInStart: string | null;
    moveInEnd: string | null;
    createdAt: string;
    updatedAt: string;
    mediaUrls: string[];
    status: 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';
    viewCount: number;
};

export default function SavedListings() {
    const { username } = useUser(); // assumed to be a string or undefined
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!username) return; // not signed in yet
        const ac = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getSavedListings(username, page, pageSize);
                if (ac.signal.aborted) return;
                setListings(res.listings);
                setTotal(res.total);
            } catch (e: any) {
                if (ac.signal.aborted) return;
                setError(e?.message ?? 'Failed to load saved listings');
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [username, page]);

    if (!username) {
        return (
            <div className="p-4 text-gray-600">
                Please sign in to view your saved listings.
            </div>
        );
    }

    if (loading) {
        return <div className="p-4">Loading saved listings…</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600">
                {error}
            </div>
        );
    }

    if (!listings.length) {
        return (
            <div className="p-4 text-gray-600">
                You haven’t saved any listings yet.
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Saved Listings ({total})</h2>

            <ul className="space-y-3">
                {listings.map((l) => (
                    <li key={l.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <Link to={`/listings/${l.id}`} className="text-lg font-medium hover:underline">
                                    {l.title}
                                </Link>
                                <div className="text-sm text-gray-500">
                                    by {l.user} • {l.location}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                {Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(l.price / 100)}
                            </div>
                        </div>
                        {l.description && (
                            <p className="mt-2 text-gray-700 line-clamp-2">{l.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                            {l.moveInStart ?? '—'} → {l.moveInEnd ?? '—'}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Simple pagination */}
            <div className="flex items-center gap-2 pt-2">
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    Prev
                </button>
                <span className="text-sm">
                    Page {page} / {totalPages}
                </span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

