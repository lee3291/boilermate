import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

import { getSavedListings } from "../../../services/savedListings";
import { useUser } from "./temp/UserContext";

type Listing = {
    id: string;
    title: string;
    user: string;
    description?: string;
    price: number; // cents
    location: string;
    moveInStart: string | null;
    moveInEnd: string | null;
};

const PAGE_SIZE = 20;

export default function SavedListings() {
    const { username } = useUser();
    const [listings, setListings] = useState<Listing[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
        [total]
    );

    useEffect(() => {
        if (!username) return;

        const ac = new AbortController();
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getSavedListings(username, page, PAGE_SIZE);
                if (ac.signal.aborted) return;
                setListings(res.listings);
                setTotal(res.total);
            } catch (e: any) {
                if (ac.signal.aborted) return;
                setError(e?.message ?? "Failed to load saved listings");
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [username, page]);

    if (!username) {
        return (
            <div className="w-full">
                <Navbar />
                <div className="p-6 text-gray-600">Please sign in to view your saved listings.</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Navbar />

            <div className="px-20 pt-6 space-y-4">
                <h1 className="font-sourceserif4-18pt-regular text-[55px] tracking-[-0.02em] text-maingray">
                    Saved Listings{total ? ` (${total})` : ""}
                </h1>

                {loading && <div className="p-4">Loading saved listings…</div>}

                {!loading && error && (
                    <div className="p-4 text-red-600 border border-red-200 rounded">{error}</div>
                )}

                {!loading && !error && listings.length === 0 && (
                    <div className="p-4 text-gray-600">You haven’t saved any listings yet.</div>
                )}

                {!loading && !error && listings.length > 0 && (
                    <>
                        <ul className="space-y-3">
                            {listings.map((l) => {
                                const formattedPrice = Intl.NumberFormat(undefined, {
                                    style: "currency",
                                    currency: "USD",
                                }).format(l.price / 100);

                                return (
                                    <li key={l.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/listings/${l.id}`}
                                                    state={{
                                                        id: l.id,
                                                        title: l.title,
                                                        author: l.user,
                                                        price: formattedPrice, // string, as ListingDetails expects
                                                        body: l.description ?? "",
                                                        location: l.location,
                                                        moveInStart: l.moveInStart ?? "—",
                                                        moveInEnd: l.moveInEnd ?? "—",
                                                    }}
                                                    className="text-lg font-roboto-semibold hover:underline break-words"
                                                >
                                                    {l.title}
                                                </Link>
                                                <div className="text-sm text-gray-500 truncate">
                                                    by {l.user} • {l.location}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700 font-roboto-light shrink-0">
                                                {formattedPrice}
                                            </div>
                                        </div>

                                        {l.description ? (
                                            <p className="mt-2 text-gray-700 line-clamp-2 font-roboto-light">
                                                {l.description}
                                            </p>
                                        ) : null}

                                        <div className="mt-2 text-xs text-gray-500">
                                            {l.moveInStart ?? "—"} → {l.moveInEnd ?? "—"}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Pagination */}
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
                    </>
                )}
            </div>
        </div>
    );
}

