import Navbar from "../components/Navbar.tsx"
import Card from "./ListingsCard.tsx"
import useSWR from 'swr';
import { fetcher } from '../../../services/listingsFetcher';
import { useState, useMemo } from "react";
import CreateListingModal from "./CreateListingModal";

export default function Listings() {
    const { data, error, isLoading, mutate } = useSWR('/listings/active', fetcher);
    const [openCreate, setOpenCreate] = useState(false);
    const [query, setQuery] = useState('');

    const [minDollar, setMinDollar] = useState<string>('');
    const [maxDollar, setMaxDollar] = useState<string>('');

    const minCents = useMemo(() => {
        const n = parseFloat(minDollar);
        return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : undefined;
    }, [minDollar]);

    const maxCents = useMemo(() => {
        const n = parseFloat(maxDollar);
        return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : undefined;
    }, [maxDollar]);

    const filtered = useMemo(() => {
        if (!data) return data;
        const q = query.toLowerCase().trim();

        return data.filter((l: any) => {
            const textOk =
                !q ||
                    (l.title ?? '').toLowerCase().includes(q) ||
                    (l.description ?? '').toLowerCase().includes(q);

            const price = Number(l.price ?? 0);
            const minOk = minCents === undefined || price >= minCents;
            const maxOk = maxCents === undefined || price <= maxCents;

            return textOk && minOk && maxOk;
        });
    }, [data, query, minCents, maxCents]);

    return (
        <div className="bg-white w-full h-[400px]">
            <Navbar />

            <div className="pt-4 flex items-start gap-4">
                <div className="pl-15">
                    <h1 className="pb-2 font-extralight font-sourceserif4-18pt-regular tracking-[-0.02em] text-[55px] text-maingray">
                        Listings
                    </h1>

                    <div className="flex flex-col">
                        <button
                            onClick={() => setOpenCreate(true)}
                            className="h-12 w-60 bg-white border border-black rounded-[100px] font-sans hover:bg-black hover:text-white transition cursor-pointer"
                        >
                            Create a Listing
                        </button>

                        <h1 className="pt-5 font-extralight font-sourceserif4-18pt-regular tracking-[-0.02em] text-[40px] text-maingray">
                            Search
                        </h1>

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search listings"
                            className="h-10 w-60 border border-gray-300 rounded-[100px] px-4 text-sm outline-none focus:border-gray-400"
                            />

                        <h1 className="pt-5 font-extralight font-sourceserif4-18pt-regular tracking-[-0.02em] text-[40px] text-maingray">
                            Filter
                        </h1>

                        {/* Price range (dollars) */}
                        <div className="flex flex-col justify-start gap-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Min $</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={minDollar}
                                    onChange={(e) => setMinDollar(e.target.value)}
                                    placeholder="0.00"
                                    className="h-9 w-28 border border-gray-300 rounded-[100px] px-3 text-sm outline-none focus:border-gray-400"
                                    />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Max $</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={maxDollar}
                                    onChange={(e) => setMaxDollar(e.target.value)}
                                    placeholder="9999.99"
                                    className="h-9 w-28 border border-gray-300 rounded-[100px] px-3 text-sm outline-none focus:border-gray-400"
                                    />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setMinDollar('');
                                    setMaxDollar('');
                                }}
                                className="h-9 px-3 border border-gray-300 rounded-[100px] text-sm hover:bg-gray-100"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div aria-hidden className="mt-10 w-px bg-gray-900 h-200" />

                <div className="flex-1 pb-10">
                    <div className="flex flex-wrap justify-between w-fit gap-10 ml-5 mr-16 mt-10">
                        {isLoading && <div>Loading…</div>}
                        {error && (
                            <div className="text-red-600 text-sm whitespace-pre-wrap">
                                {String(error.message || error)}
                            </div>
                        )}
                        {data?.length === 0 && <div>No active listings.</div>}
                        {data && filtered?.length === 0 && data.length > 0 && (
                            <div className="font-roboto-light">
                                No matches for “{query}”
                                {minDollar || maxDollar ? ` within $${minDollar || '0'}–$${maxDollar || '∞'}` : ''}.
                            </div>
                        )}

                        {filtered?.map((l: any) => (
                            <Card
                                id={l.id}
                                title={l.title}
                                author={l.user ?? 'Unknown'}
                                price={`$${(l.price / 100).toFixed(2)}`}
                                body={l.description}
                                />
                        ))}
                    </div>
                </div>
            </div>

            <CreateListingModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={() => {
                    mutate();
                }}
                />
        </div>
    );
}

