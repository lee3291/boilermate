import { useEffect, useState } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from "react-router-dom";
import SaveBlack from "../../../assets/images/save-black.png";
import SaveWhite from "../../../assets/images/save-white.png";
import { toggleSave } from "../../../services/saves";
import { getSavedListings } from "../../../services/savedListings";
import { getSavedHint, setSavedHint } from "../../../services/savedCache";

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
}: ListingsCardProps) {
    // null = unknown (don’t render yet), true = saved, false = not saved
    const [clicked, setClicked] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
    const { user: authUser } = useAuth();

    // derive a stable "username" from the auth user (same fallback order used elsewhere)
    const listingUser = (() => {
        if (!authUser) return null;
        const maybeUsername = (authUser as any).username ?? (authUser as any).displayName;
        if (typeof maybeUsername === 'string' && maybeUsername.trim()) return maybeUsername.trim();
        if (typeof (authUser as any).email === 'string' && (authUser as any).email.includes('@')) {
            return (authUser as any).email.split('@')[0].trim();
        }
        if ((authUser as any).id) return String((authUser as any).id);
        return null;
    })();

    // 1) Seed from cache to avoid white flash
    useEffect(() => {
        if (!listingUser || !id) {
            setClicked(false);
            return;
        }
        const hint = getSavedHint(listingUser, id); // true | undefined
        if (hint === true) setClicked(true); // show black immediately
        else setClicked(null);               // keep hidden until we check
    }, [listingUser, id]);

    // 2) Confirm from network (only if unknown or hint was missing)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!listingUser || !id) return;
            if (clicked === true) return; // already confident from cache
            try {
                const res = await getSavedListings(listingUser, 1, 100);
                if (cancelled) return;
                const isSaved = res.listings.some((l) => l.id === id);
                setClicked(isSaved);
                setSavedHint(listingUser, id, isSaved);
            } catch {
                // don’t block UI; assume not saved if unknown
                if (!cancelled) setClicked(false);
            }
        })();
        return () => { cancelled = true; };
    }, [listingUser, id]); // intentionally not depending on `clicked`

    const onToggleSave = async () => {
        if (!listingUser) {
            alert("Please sign in to save listings.");
            return;
        }
        const current = clicked ?? false;
        const next = !current;

        setClicked(next);
        setSavedHint(listingUser, id, next);
        setSaving(true);
        try {
            await toggleSave(id, listingUser, next);
        } catch (e: any) {
            // revert on failure
            const revert = !next;
            setClicked(revert);
            setSavedHint(listingUser, id, revert);
            console.error(e);
            alert(e?.message || "Could not update saved status.");
        } finally {
            setSaving(false);
        }
    };

    const icon =
        clicked === null ? (
            <div className={`h-6 w-6 opacity-0`} />
        ) : (
                <img
                    src={clicked ? SaveBlack : SaveWhite}
                    className={`h-6 w-auto cursor-pointer select-none ${saving ? "opacity-60 pointer-events-none" : ""}`}
                    alt={clicked ? "Saved" : "Save"}
                    onClick={onToggleSave}
                    draggable={false}
                    />
            );

    return (
        <div>
            <div className="absolute h-100 w-140 z-0 bg-black/20 blur-[5px] rounded-lg" />
            <div className="relative h-100 w-140 z-10 border-black border-[1.5px] bg-white rounded-lg">
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

