import Navbar from "../components/Navbar.tsx"
import Card from "./ListingsCard.tsx"
import useSWR from 'swr';
import { fetcher } from '../../../services/listingsFetcher';
import { useState, useMemo, useEffect } from "react";
import CreateListingModal from "./CreateListingModal";

import { useUser } from "./temp/UserContext";
import { getSavedListings } from "../../../services/savedListings";
import { setSavedHint } from "../../../services/savedCache";

type SortKey = 'none' | 'price' | 'moveInEarliest' | 'moveInLatest' | 'title' | 'location';
type SortDir = 'asc' | 'desc';

export default function Listings() {
    const { data, error, isLoading, mutate } = useSWR('/listings/active', fetcher);
    const [openCreate, setOpenCreate] = useState(false);
    const [query, setQuery] = useState('');

    const [minDollar, setMinDollar] = useState<string>('');
    const [maxDollar, setMaxDollar] = useState<string>('');

    const [minMoveIn, setMinMoveIn] = useState<string>('');
    const [maxMoveIn, setMaxMoveIn] = useState<string>('');

    const [locFilter, setLocFilter] = useState<string>('');

    const [sortKey, setSortKey] = useState<SortKey>('none');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const { username } = useUser();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!username || !data || data.length === 0) return;
            try {
                const res = await getSavedListings(username, 1, 500);
                if (cancelled) return;

                for (const s of res.listings ?? []) {
                    setSavedHint(username, s.id, true);
                }
            } catch {
            }
        })();

        return () => { cancelled = true; };
    }, [username, data]);

    const minMoveMs = useMemo(
        () => (minMoveIn ? new Date(minMoveIn + 'T00:00:00').getTime() : undefined),
        [minMoveIn]
    );
    const maxMoveMs = useMemo(
        () => (maxMoveIn ? new Date(maxMoveIn + 'T23:59:59.999').getTime() : undefined),
        [maxMoveIn]
    );

    const desiredMoveStart = useMemo(() => {
        if (minMoveMs === undefined && maxMoveMs === undefined) return undefined;
        if (minMoveMs !== undefined && maxMoveMs !== undefined) return Math.min(minMoveMs, maxMoveMs);
        return minMoveMs;
    }, [minMoveMs, maxMoveMs]);

    const desiredMoveEnd = useMemo(() => {
        if (minMoveMs === undefined && maxMoveMs === undefined) return undefined;
        if (minMoveMs !== undefined && maxMoveMs !== undefined) return Math.max(minMoveMs, maxMoveMs);
        return maxMoveMs;
    }, [minMoveMs, maxMoveMs]);

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

            const listStart = l.moveInStart ? new Date(l.moveInStart).getTime() : -Infinity;
            const listEnd   = l.moveInEnd   ? new Date(l.moveInEnd).getTime()   : +Infinity;

            const wantStart = desiredMoveStart ?? -Infinity;
            const wantEnd   = desiredMoveEnd   ?? +Infinity;

            const moveOk = (listStart <= wantEnd) && (listEnd >= wantStart);
            const locationOk =
                !locFilter ||
                String(l.location ?? '').toLowerCase().includes(locFilter.toLowerCase().trim());

            return textOk && minOk && maxOk && moveOk && locationOk;
        });
    }, [data, query, minCents, maxCents, desiredMoveStart, desiredMoveEnd, locFilter]);

    const displayed = useMemo(() => {
        if (!filtered) return filtered;
        const arr = [...filtered];

        const getEarliestMove = (l: any) => l.moveInStart ? new Date(l.moveInStart).getTime() : +Infinity;
        const getLatestMove = (l: any) => l.moveInEnd ? new Date(l.moveInEnd).getTime() : -Infinity;

        if (sortKey === 'price') {
            arr.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0));
        } else if (sortKey === 'moveInEarliest') {
            arr.sort((a: any, b: any) => getEarliestMove(a) - getEarliestMove(b));
        } else if (sortKey === 'moveInLatest') {
            arr.sort((a: any, b: any) => getLatestMove(b) - getLatestMove(a));
        } else if (sortKey === 'title') {
            arr.sort((a: any, b: any) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
        } else if (sortKey === 'location') {
            arr.sort((a: any, b: any) => String(a.location ?? '').localeCompare(String(b.location ?? '')));
        }

        if (sortDir === 'desc' && sortKey !== 'none') arr.reverse();
        return arr;
    }, [filtered, sortKey, sortDir]);

    const pillBase = "h-9 px-4 rounded-[100px] text-sm transition cursor-pointer";
    const pillIdle = "bg-white border border-gray-300 hover:bg-gray-100";
    const pillActive = "bg-black text-white";

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
                            className="h-12 w-60 bg-white border border-black rounded-[100px] font-sans hover:bg-gray-100 transition cursor-pointer"
                        >
                            Create a Listing
                        </button>

                        <a
                            className="mt-2 h-12 w-60 hover:bg-maingray border rounded-[100px] font-sans bg-black text-white transition cursor-pointer text-center pt-[11px]"
                            href="/saved">
                            Saved Listings
                        </a>

                        <a
                            className="mt-2 h-12 w-60 hover:bg-maingray border rounded-[100px] font-sans bg-black text-white transition cursor-pointer text-center pt-[11px]"
                            href="/listing-map">
                            Listings Map
                        </a>

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
                        </div>

                        <div className="mt-2 flex flex-col justify-start gap-2">
                            <div className="flex flex-col items-start gap-2">
                                <label className="text-sm text-gray-700">Earliest move-in</label>
                                <input
                                    type="date"
                                    value={minMoveIn}
                                    onChange={(e) => setMinMoveIn(e.target.value)}
                                    className="h-9 w-44 border border-gray-300 rounded-[100px] px-3 text-sm outline-none focus:border-gray-400"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <label className="text-sm text-gray-700">Latest move-in</label>
                                <input
                                    type="date"
                                    value={maxMoveIn}
                                    onChange={(e) => setMaxMoveIn(e.target.value)}
                                    className="h-9 w-44 border border-gray-300 rounded-[100px] px-3 text-sm outline-none focus:border-gray-400"
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <label className="text-sm text-gray-700">Location</label>
                            <input
                                type="text"
                                value={locFilter}
                                onChange={(e) => setLocFilter(e.target.value)}
                                placeholder="e.g. West Lafayette"
                                className="h-9 w-40 border border-gray-300 rounded-[100px] px-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setMinDollar('');
                                setMaxDollar('');
                                setMinMoveIn('');
                                setMaxMoveIn('');
                                setLocFilter('');
                            }}
                            className="mt-2 h-9 px-3 border border-gray-300 rounded-[100px] text-sm hover:bg-gray-100"
                        >
                            Clear
                        </button>

                        <h1 className="pt-5 font-extralight font-sourceserif4-18pt-regular tracking-[-0.02em] text-[40px] text-maingray">
                            Sort
                        </h1>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'price' && sortDir === 'asc' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('price'); setSortDir('asc'); }}
                            >
                                Price ↑
                            </button>
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'price' && sortDir === 'desc' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('price'); setSortDir('desc'); }}
                            >
                                Price ↓
                            </button>
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'moveInEarliest' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('moveInEarliest'); setSortDir('asc'); }}
                            >
                                First move-in
                            </button>
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'moveInLatest' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('moveInLatest'); setSortDir('asc'); }}
                            >
                                Last move-in
                            </button>
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'title' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('title'); setSortDir('asc'); }}
                            >
                                Title A–Z
                            </button>
                            <button
                                className={`${pillBase} w-30 ${sortKey === 'location' ? pillActive : pillIdle}`}
                                onClick={() => { setSortKey('location'); setSortDir('asc'); }}
                            >
                                Location A–Z
                            </button>
                        </div>
                        <button
                            className="mt-5 h-9 px-4 rounded-[100px] text-sm transition cursor-pointer bg-white border border-gray-300 hover:bg-gray-100"
                            onClick={() => { setSortKey('none'); setSortDir('asc'); }}
                        >
                            Clear sort
                        </button>
                    </div>
                </div>

                <div aria-hidden className="mt-10 w-px bg-gray-900 h-300" />

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

                        {displayed?.map((l: any) => (
                            <Card
                                key={l.id}
                                location={l.location}
                                id={l.id}
                                title={l.title}
                                author={l.user ?? 'Unknown'}
                                price={`$${(l.price / 100).toFixed(2)}`}
                                roommates={l.roommates}
                                body={l.description}
                                moveInEnd={l.moveInEnd}
                                moveInStart={l.moveInStart}
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

