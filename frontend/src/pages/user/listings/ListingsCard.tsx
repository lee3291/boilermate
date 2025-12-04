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
    hasDescriptionAlert?: boolean;
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
    hasDescriptionAlert,
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
            } catch { }
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

    // Existing move-in date alert → ARCHIVED
    useEffect(() => {
        if (!isOwner) return;
        if (!moveInEnd) return;

        const endDate = new Date(moveInEnd);
        if (Number.isNaN(endDate.getTime())) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const shouldFlagOutdated = endDate < today;

        if (!shouldFlagOutdated) return;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/listings/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ moveInDateOutdatedAlert: true }),
                });
                if (!res.ok) {
                    console.error(
                        "[ListingsCard] Failed to set moveInDateOutdatedAlert",
                        res.status
                    );
                }
            } catch (e) {
                if (!cancelled) console.error(e);
            }
        })();

        return () => { cancelled = true; };
    }, [id, moveInEnd, isOwner]);

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
    const [flagCount, setFlagCount] = useState<number | null>(null);
    const [applySaving, setApplySaving] = useState(false);

    const [hasApplied, setHasApplied] = useState<boolean | null>(null);

    // Load report state (description outdated alerts)
    useEffect(() => {
        if (!viewerUsername || !id) {
            setFlagged(false);
            setFlagCount(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/listings/${id}/report?username=${encodeURIComponent(
                        viewerUsername,
                    )}`,
                );
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled) return;

                setFlagged(!!json.isReported);
                if (typeof json.reportCount === "number") {
                    setFlagCount(json.reportCount);
                } else {
                    setFlagCount(null);
                }
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    setFlagged(false);
                    setFlagCount(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [viewerUsername, id]);

    // automatically PAUSE (INACTIVE) the listing in the DB.
    // useEffect(() => {
    //     if (!isOwner) return;
    //     if (flagCount == null || flagCount <= 0) return;
    //     if (listingStatus === 'INACTIVE' || listingStatus === 'ARCHIVED') return;
    //
    //     // Set status to PAUSED / INACTIVE
    //     void updateStatus('INACTIVE');
    // }, [isOwner, flagCount, listingStatus]);

    useEffect(() => {
        if (!viewerUsername || !id || isOwner) {
            setHasApplied(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const params = new URLSearchParams();
                params.set("page", "1");
                params.set("pageSize", "100");

                const res = await fetch(
                    `${API_BASE}/listings/users/${encodeURIComponent(
                        viewerUsername,
                    )}/roommate-applications?${params.toString()}`,
                );
                if (!res.ok) {
                    if (!cancelled) setHasApplied(false);
                    return;
                }
                const json = await res.json();
                if (cancelled) return;

                const apps: any[] = Array.isArray(json.applications)
                    ? json.applications
                    : [];
                const already = apps.some(
                    (a) => String(a.listingId) === String(id),
                );
                setHasApplied(already);
            } catch (e) {
                console.error("[ListingsCard] failed to load applications", e);
                if (!cancelled) setHasApplied(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [viewerUsername, id, isOwner]);

    const onToggleFlag = async () => {
        if (!viewerUsername) {
            alert("Please sign in to report listings.");
            return;
        }
        if (flagSaving) return;

        const next = !flagged;

        if (next) {
            const confirmed = window.confirm("Are you sure you want to report this listing as outdated?");
            if (!confirmed) {
                return;
            }
        }

        setFlagged(next);
        setFlagSaving(true);
        try {
            const res = await fetch(`${API_BASE}/listings/${id}/report`, {
                method: next ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: viewerUsername }),
            });
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
            const json = await res.json();

            if (typeof json.isReported === "boolean") {
                setFlagged(json.isReported);
            }
            if (typeof json.reportCount === "number") {
                setFlagCount(json.reportCount);
            }
        } catch (e) {
            console.error(e);

            setFlagged(!next);
            alert("Could not update report status.");
        } finally {
            setFlagSaving(false);
        }
    };

    const onApplyToJoin = async () => {
        if (!viewerUsername) {
            alert("Please sign in to apply to join listings.");
            return;
        }
        if (isOwner) {
            alert("You cannot apply to join your own listing.");
            return;
        }
        if (applySaving) return;
        if (listingStatus !== 'ACTIVE') {
            alert("This listing is not currently accepting applications.");
            return;
        }
        if (hasApplied) {
            alert("You have already applied to this listing. Your existing application is still active.");
            return;
        }

        setApplySaving(true);
        try {
            const res = await fetch(`${API_BASE}/listings/${id}/roommate-applications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicantId: viewerUsername }),
            });
            const raw = await res.text();

            if (!res.ok) {
                let msg = `Failed to apply to join (${res.status})`;
                try {
                    const data = raw ? JSON.parse(raw) : null;
                    if (data?.message) {
                        msg =
                            typeof data.message === "string"
                                ? data.message
                                : JSON.stringify(data.message);
                    }
                } catch { }
                throw new Error(msg);
            }

            let created = true;
            try {
                const data = raw ? JSON.parse(raw) : null;
                if (data && typeof data.created === "boolean") {
                    created = data.created;
                }
            } catch { }

            if (created) {
                setHasApplied(true);
                alert("Application submitted to join this listing.");
            } else {
                setHasApplied(true);
                alert("You have already applied to this listing. Your existing application is still active.");
            }
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Could not submit your application. Please try again.");
        } finally {
            setApplySaving(false);
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

    const flagIcon = !isOwner ? (
        <img
            src={flagged ? FlagBlack : FlagWhite}
            className={`h-6 w-6 cursor-pointer select-none object-contain ${flagSaving ? "opacity-60 pointer-events-none" : ""}`}
            alt="Flag listing"
            draggable={false}
            onClick={onToggleFlag}
        />
    ) : null;

    const style = widthStyle ? { width: widthStyle } : undefined;

    const applyDisabled =
        applySaving || !!hasApplied || listingStatus !== 'ACTIVE';

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
                                <button
                                    className={`mt-10 h-12 w-35 font-roboto-light rounded-4xl cursor-pointer ${
                                        applyDisabled
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-black text-white"
                                    }`}
                                    type="button"
                                    onClick={onApplyToJoin}
                                    disabled={applyDisabled}
                                >
                                    {applySaving
                                        ? "Submitting…"
                                        : hasApplied
                                        ? "Already applied"
                                        : "Apply to join"}
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

