import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../../contexts/AuthContext';
import SaveBlack from "../../../assets/images/save-black.png";
import SaveWhite from "../../../assets/images/save-white.png";
import FlagBlack from "../../../assets/images/flag-black.png";
import FlagWhite from "../../../assets/images/flag-white.png";
import { toggleSave } from "../../../services/saves";
import { getSavedListings } from "../../../services/savedListings";
import { getSavedHint, setSavedHint } from "../../../services/savedCache";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

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
    status?: ListingStatus;
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
    status,
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


    const [statusSaving, setStatusSaving] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [listingStatus, setListingStatus] = useState<ListingStatus>(status ?? 'ACTIVE');

    useEffect(() => {
        if (status) setListingStatus(status);
    }, [status]);

    const isExpired = useMemo(() => {
        if (!moveInEnd) return false;
        const endDate = new Date(moveInEnd);
        if (Number.isNaN(endDate.getTime())) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return endDate < today;
    }, [moveInEnd]);

    const updateStatus = async (next: ListingStatus) => {
        setStatusError(null);
        const prev = listingStatus;
        setListingStatus(next);
        setStatusSaving(true);
        try {
            const res = await fetch(`${API_BASE}/listings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next }),
            });
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
        } catch (e: any) {
            setListingStatus(prev);
            setStatusError(e?.message || 'Failed to update status');
        } finally {
            setStatusSaving(false);
        }
    };

    useEffect(() => {
        if (!isExpired) return;
        if (listingStatus === 'ARCHIVED') return;

        updateStatus('ARCHIVED');
    }, [isExpired, listingStatus]);

    const [flagged, setFlagged] = useState(false);
    const [flagSaving, setFlagSaving] = useState(false);

    const onToggleFlag = async () => {
        const next = !flagged;
        setFlagged(next);
        setFlagSaving(true);
        try {
            const res = await fetch(`${API_BASE}/listings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportedOutdatedAlert: next }),
            });
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
        } catch (e) {
            setFlagged(!next);
            console.error(e);
        } finally {
            setFlagSaving(false);
        }
    };

    const statusControl = isOwner ? (
        <div className="mt-10 flex items-center gap-3">
            <label className="text-sm text-gray-600">Status:</label>
            <div className="relative">
                <select
                    className="h-12 min-w-48 appearance-none rounded-4xl border-1 border-black bg-white px-5 pr-9 text-[16px] font-roboto-regular cursor-pointer"
                    value={listingStatus}
                    onChange={(e) => updateStatus(e.target.value as ListingStatus)}
                    disabled={statusSaving}
                    aria-label="Set listing status"
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">PAUSED</option>
                    <option value="ARCHIVED">EXPIRED</option>
                </select>
                {/* caret */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">▾</span>
            </div>
            {statusSaving && <span className="text-xs text-gray-500">Saving…</span>}
            {statusError && <span className="text-xs text-red-600">{statusError}</span>}
        </div>
    ) : null;

    const icon = !saveEnabled ? (
        <div className="h-6 w-6" />
    ) : clicked === null ? (
            <div className="h-6 w-6 opacity-0" />
        ) : (
            <img
                src={clicked ? SaveBlack : SaveWhite}
                className={`h-6 w-6 cursor-pointer select-none object-contain text-wrap ${saving ? "opacity-60 pointer-events-none" : ""}`}
                alt={clicked ? "Saved" : "Save"}
                onClick={onToggleSave}
                draggable={false}
                />
        );

    const flagIcon = (
        <img
            src={flagged ? FlagBlack : FlagWhite}
            className={`h-6 w-6 cursor-pointer select-none object-contain ${flagSaving ? "opacity-60 pointer-events-none" : ""}`}
            alt="Flag listing"
            draggable={false}
            onClick={onToggleFlag}
            />
    );

    const style = widthStyle ? { width: widthStyle } : undefined;

    return (
        <div>
            <div className={`absolute h-100 ${widthClass} z-0 bg-black/20 blur-[5px] rounded-lg`} style={style} />
            <div className={`relative h-100 ${widthClass} z-10 border-black border-[1.5px] bg-white rounded-lg`} style={style}>
                <div className="py-5 px-5">
                    <div className="flex items-center">
                        <h1 className="flex-[3] font-roboto-regular text-3xl tracking-[-0.4pt]">{title}</h1>
                        <div className="flex-[2] flex items-center">
                            <h1 className="mt-1 font-sourceserif4-18pt-regular text-[20px] text-gray-400 tracking-[-0.4pt]">
                                {location}
                            </h1>
                            <div className="shrink-0 flex flex-col gap-3">
                                {icon}
                                {flagIcon}
                            </div>
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
                        {isOwner ? (
                            <>
                                {statusControl}
                            </>
                        ) : (
                                <>
                                    <button className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer">
                                        Apply to join
                                    </button>
                                    <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer">
                                        Contact
                                    </button>
                                </>
                            )}

                        <Link
                            to={`/listings/${id}`}
                            state={{ id, title, author, price, body, location, moveInStart, moveInEnd, roommates, status: listingStatus }}
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

