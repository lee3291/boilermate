import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function ListingDetails() {
    const { user: authUser } = useAuth();
    const { state } = useLocation() as {
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

    const viewerUsername = useMemo(() => {
        if (!authUser) return null;
        const maybeUsername = (authUser as any).username ?? (authUser as any).displayName;
        if (typeof maybeUsername === "string" && maybeUsername.trim()) return maybeUsername.trim();
        if (typeof (authUser as any).email === "string" && (authUser as any).email.includes("@")) {
            return (authUser as any).email.split("@")[0].trim();
        }
        if ((authUser as any).id) return String((authUser as any).id);
        return null;
    }, [authUser]);

    if (!state) return <div>Open this page via the card.</div>;

    const { title, author, price, body, id, location, moveInStart, moveInEnd } = state;

    const isOwner = useMemo(() => {
        const a = String(author || "").trim().toLowerCase();
        const v = String(viewerUsername || "").trim().toLowerCase();
        return !!a && !!v && a === v;
    }, [author, viewerUsername]);

    const [viewCount, setViewCount] = useState<number | null>(null);
    const [uniqueCount, setUniqueCount] = useState<number | null>(null);

    const postedRef = useRef(false);
    useEffect(() => {
        if (postedRef.current) return;
        postedRef.current = true;

        const viewerKey = viewerUsername ?? "anon";
        const key = `viewed:${id}:${viewerKey}`;

        if (sessionStorage.getItem(key)) {
            return;
        }
        sessionStorage.setItem(key, "1");

        const body = viewerUsername ? { username: viewerUsername } : {};
        fetch(`${API_BASE}/listings/${id}/views`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).catch(() => {});
    }, [id, viewerUsername]);

    // If owner, fetch counts for display
    useEffect(() => {
        if (!isOwner) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/listings/${id}/views/counts`);
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) {
                    setViewCount(json.viewCount ?? 0);
                    setUniqueCount(json.uniqueCount ?? 0);
                }
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [isOwner, id]);

    return (
        <div className="w-full h-400">
            <Navbar />

            <div className="pt-10 pl-18">
                <div className="flex justify-between">
                    <h1 className="font-sourceserif4-18pt-regular text-[55px] tracking-[-0.02em] text-maingray">{title}</h1>

                    <div className="flex justify-baseline gap-3 mr-20 -mt-5">
                        <button className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer">
                            Apply to join
                        </button>
                        <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer">
                            Contact
                        </button>
                    </div>
                </div>

                <div className="flex justify-end mr-22">
                    <a href="/listings" className="font-roboto-light hover:underline hover:underline-offset-2">Return to Listings</a>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex gap-10">
                        <p className="text-gray-500 text-[20px] font-roboto-italic tracking-[-0.02em] ">Created by {author}</p>
                        <p className="-mt-[1px] text-gray-400 font-sourceserif4-18pt-italic text-[20px]">{price}</p>
                    </div>

                    {isOwner && (
                        <div className="text-sm text-gray-500 font-roboto-italic text-[20px]">
                            Views: {viewCount ?? "—"}{typeof uniqueCount === "number" ? ` (${uniqueCount} unique)` : ""}
                        </div>
                    )}
                </div>

                <p className="font-roboto-italic text-[20px] text-gray-600 ">Location: {location}</p>
                <p className="font-roboto-italic text-[20px] text-gray-600 ">Move in Date: {moveInStart} - {moveInEnd}</p>

                <h2 className="mt-10 font-sourceserif4-18pt-regular text-[40px] tracking-[-0.02em] text-maingray">Description</h2>
                <p className="mt-1 font-roboto-light text-[20px] tracking-[-0.02em]">{body}</p>

                <p className="mt-6 text-sm font-roboto-light text-gray-400">Listing ID: {id}</p>
            </div>
        </div>
    );
}

