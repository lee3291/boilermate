import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../../contexts/AuthContext';
import SaveBlack from "../../../assets/images/save-black.png";
import SaveWhite from "../../../assets/images/save-white.png";
import { toggleSave } from "../../../services/saves";
import { getSavedListings } from "../../../services/savedListings";
import { getSavedHint, setSavedHint } from "../../../services/savedCache";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ListingsCardProps = {
    id: string;
    title: string;
    author: string;
    price: string;
    roommates: string;
    body: string;
    location: string;
    moveInStart: string;
    moveInEnd: string;
    widthClass?: string;
    widthStyle?: string;
    saveEnabled?: boolean;
};

export default function ListingsCard({
    id,
    title,
    author,
    price,
    roommates,
    body,
    location,
    moveInStart,
    moveInEnd,
    widthClass = "w-140",
    widthStyle,
    saveEnabled = true,
}: ListingsCardProps) {
    const [clicked, setClicked] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
    const { user: authUser } = useAuth();

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

    // seed saved-state from cache
    useEffect(() => {
        if (!saveEnabled) {
            setClicked(false);
            return;
        }
        if (!viewerUsername || !id) {
            setClicked(false);
            return;
        }
        const hint = getSavedHint(viewerUsername, id);
        if (hint === true) setClicked(true);
        else setClicked(null);
    }, [viewerUsername, id, saveEnabled]);

    // confirm saved-state from network
    useEffect(() => {
        if (!saveEnabled) return;
        let cancelled = false;
        (async () => {
            if (!viewerUsername || !id) return;
            if (clicked === true) return;
            try {
                const res = await getSavedListings(viewerUsername, 1, 100);
                if (cancelled) return;
                const isSaved = res.listings.some((l: any) => l.id === id);
                setClicked(isSaved);
                setSavedHint(viewerUsername, id, isSaved);
            } catch {
                if (!cancelled) setClicked(false);
            }
        })();
        return () => { cancelled = true; };
    }, [viewerUsername, id, saveEnabled]);

    const onToggleSave = async () => {
        if (!saveEnabled) return;
        if (!viewerUsername) {
            alert("Please sign in to save listings.");
            return;
        }
        const current = clicked ?? false;
        const next = !current;

        setClicked(next);
        setSavedHint(viewerUsername, id, next);
        setSaving(true);
        try {
            await toggleSave(id, viewerUsername, next);
        } catch (e: any) {
            const revert = !next;
            setClicked(revert);
            setSavedHint(viewerUsername, id, revert);
            console.error(e);
            alert(e?.message || "Could not update saved status.");
        } finally {
            setSaving(false);
        }
    };

    // ----- Owner counts (read-only on card; no increments here) -----
    const [viewCount, setViewCount] = useState<number | null>(null);
    const [uniqueCount, setUniqueCount] = useState<number | null>(null);

    const isOwner = useMemo(() => {
        const a = String(author || "").trim().toLowerCase();
        const v = String(viewerUsername || "").trim().toLowerCase();
        return !!a && !!v && a === v;
    }, [author, viewerUsername]);

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

    const icon = !saveEnabled ? (
        <div className="h-6 w-6" />
    ) : clicked === null ? (
            <div className="h-6 w-6 opacity-0" />
        ) : (
            <img
                src={clicked ? SaveBlack : SaveWhite}
                className={`h-6 w-auto cursor-pointer select-none ${saving ? "opacity-60 pointer-events-none" : ""}`}
                alt={clicked ? "Saved" : "Save"}
                onClick={onToggleSave}
                draggable={false}
                />
        );

    const style = widthStyle ? { width: widthStyle } : undefined;

    return (
        <div>
            <div className={`absolute h-100 ${widthClass} z-0 bg-black/20 blur-[5px] rounded-lg`} style={style} />
            <div className={`relative h-100 ${widthClass} z-10 border-black border-[1.5px] bg-white rounded-lg`} style={style}>
                <div className="py-5 px-5">
                    <div className="flex justify-between">
                        <h1 className="font-roboto-regular text-3xl tracking-[-0.4pt]">{title}</h1>
                        <div className="flex items-center gap-3">
                            <h1 className="mt-1 font-sourceserif4-18pt-regular text-[20px] text-gray-400 tracking-[-0.4pt]">
                                {location}
                            </h1>
                            {icon}
                        </div>
                    </div>

                    <h1 className="pt-2 text-gray-500 font-roboto-italic text-lg">Created by {author}</h1>
                    <h1 className="pt-2 text-gray-500 font-roboto-italic text-lg">Looking for {roommates} roommates(s)</h1>
                    <h1 className="text-gray-500 font-roboto-bold text-lg">{price}</h1>

                    {isOwner && (
                        <div className="mt-1 text-xs text-gray-500 font-roboto-italic text-[16px]">
                            Views: {viewCount ?? "—"}{typeof uniqueCount === "number" ? ` (${uniqueCount} unique)` : ""}
                        </div>
                    )}

                    <h1 className="pt-2 font-roboto-light text-lg text-wrap">{body}</h1>

                    <div className="flex justify-start gap-3">
                        <button className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer">
                            Apply to join
                        </button>
                        <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer">
                            Contact
                        </button>

                        <Link
                            to={`/listings/${id}`}
                            state={{ id, title, author, price, body, location, moveInStart, moveInEnd, roommates }}
                            rel="noopener noreferrer"
                            className="ml-2 mt-13 hover:underline-offset-4 hover:underline font-roboto-light text-gray-500 cursor-pointer"
                        >
                            Read more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

