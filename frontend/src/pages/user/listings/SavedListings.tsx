import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

import { getSavedListings } from "../../../services/savedListings";
import { useUser } from "./temp/UserContext";
import ListingComparison, { type ListingForCompare } from "./ListingComparison"; // <- ADD

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

    // NEW: selection + comparison visibility
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
        [listings, selectedIds]
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
                // Clear selections if items changed
                clearSelection();
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
                <div className="p-6 text-gray-600">
                    Please sign in to view your saved listings.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Navbar />

            <div className="px-20 pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-sourceserif4-18pt-regular text-[55px] tracking-[-0.02em] text-maingray">
                            Saved Listings
                        </h1>

                        <p className="pb-5 font-roboto-light text-gray-600">
                            Total saved listings: {total ? ` ${total}` : ""}
                        </p>
                    </div>

                    <div className="mt-7 flex items-center gap-3 font-roboto-light">
                        <a
                            className="hover:underline hover:underline-offset-2"
                            href="/listings"
                        >
                            Return to Listings
                        </a>

                        <div className="flex items-center gap-2">
                            <button
                                className="rounded border px-3 py-1 text-sm disabled:opacity-50 cursor-pointer hover:bg-black hover:text-white transition"
                                disabled={selectedIds.size < 2}
                                onClick={() => setShowComparison(true)}
                                title={
                                    selectedIds.size < 2
                                        ? "Select at least two to compare"
                                        : "Open comparison"
                                }
                            >
                                Compare ({selectedIds.size})
                            </button>
                            {selectedIds.size > 0 && (
                                <button
                                    className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white transition cursor-pointer"
                                    onClick={clearSelection}
                                    title="Clear selected"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading && <div className="p-4">Loading saved listings…</div>}

                {!loading && error && (
                    <div className="rounded border border-red-200 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && listings.length === 0 && (
                    <div className="p-4 text-gray-600">
                        You haven’t saved any listings yet.
                    </div>
                )}

                {!loading && !error && listings.length > 0 && (
                    <>
                        <ul className="space-y-3">
                            {listings.map((l) => {
                                const formattedPrice = Intl.NumberFormat(undefined, {
                                    style: "currency",
                                    currency: "USD",
                                }).format(l.price / 100);

                                const checked = selectedIds.has(l.id);

                                return (
                                    <li key={l.id} className="rounded-lg border p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <label className="mt-1 flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 h-4 w-4 accent-gray-700 cursor-pointer"
                                                    checked={checked}
                                                    onChange={() => toggleSelected(l.id)}
                                                    aria-label={`Select ${l.title} for comparison`}
                                                    />
                                            </label>

                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    to={`/listings/${l.id}`}
                                                    state={{
                                                        id: l.id,
                                                        title: l.title,
                                                        author: l.user,
                                                        price: formattedPrice,
                                                        body: l.description ?? "",
                                                        location: l.location,
                                                        moveInStart: l.moveInStart ?? "—",
                                                        moveInEnd: l.moveInEnd ?? "—",
                                                    }}
                                                    className="break-words text-xl font-sourceserif4-18pt-regular hover:underline"
                                                >
                                                    {l.title}
                                                </Link>
                                                <div className="truncate text-sm font-roboto-regular text-gray-400">
                                                    by {l.user} • {l.location}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-sm font-roboto-light text-gray-700">
                                                {formattedPrice}
                                            </div>
                                        </div>

                                        {l.description ? (
                                            <p className="mt-2 line-clamp-2 font-roboto-light text-gray-700">
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
                        <div className="flex items-center gap-2 pt-5">
                            <button
                                className="rounded px-3 py-1 border disabled:opacity-50"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>
                            <span className="text-sm">
                                Page {page} / {totalPages}
                            </span>
                            <button
                                className="rounded px-3 py-1 border disabled:opacity-50"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* NEW: Comparison modal */}
            {showComparison && (
                <ListingComparison
                    listings={selectedListings}
                    onClose={() => setShowComparison(false)}
                    />
            )}
        </div>
    );
}

