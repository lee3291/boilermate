import { useMemo } from "react";
import Navbar from "../../components/Navbar";
import ListingsCard from "../ListingsCard";
import { useAuth } from "../../../../contexts/AuthContext";
import useSWR from "swr";
import { fetcher } from "../../../../services/listingsFetcher";
import { Link } from "react-router-dom";

type ListingStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

function toListingStatus(v: unknown): ListingStatus {
    const u = String(v ?? "ACTIVE").toUpperCase();
    return u === "ACTIVE" || u === "INACTIVE" || u === "ARCHIVED" ? (u as ListingStatus) : "ACTIVE";
}

function normalize(v: unknown) {
    if (v == null) return null;
    const s = String(v).trim();
    return s ? s.toLowerCase() : null;
}

function emailLocalPart(e?: string | null) {
    if (!e || typeof e !== "string") return null;
    const at = e.indexOf("@");
    return at > 0 ? e.slice(0, at) : null;
}

export default function MyListings() {
    const { user: authUser } = useAuth();

    const me = useMemo(() => {
        if (!authUser) return null;
        const username = (authUser as any).username ?? (authUser as any).displayName;
        const id = (authUser as any).id ?? (authUser as any).uid;
        const email = (authUser as any).email;
        return {
            username: normalize(username),
            id: normalize(id),
            emailLocal: normalize(emailLocalPart(email)),
        };
    }, [authUser]);

    const apiUsername = useMemo(() => {
        if (!me) return null;
        return me.username ?? me.emailLocal ?? me.id ?? null;
    }, [me]);

    const { data, error, isLoading } = useSWR(
        apiUsername ? `/listings/users/${encodeURIComponent(apiUsername)}/listings` : null,
        fetcher
    );

    const mine = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    return (
        <div className="h-full w-full min-h-screen">
            <Navbar />
            <div className="mt-5 pl-16 pr-16">
                <h1 className="font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-tight">
                    Personal Listings
                </h1>

                {!authUser && (
                    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg max-w-3xl">
                        <h2 className="text-2xl font-roboto-bold mb-2">You're not signed in</h2>
                        <p className="text-gray-600 mb-4">Sign in to see your personal listings.</p>
                        <div className="flex gap-3">
                            <Link to="/login" className="px-4 py-2 bg-black text-white rounded-3xl">Sign in</Link>
                            <Link to="/create-listing" className="px-4 py-2 border border-black rounded-3xl">Create a listing</Link>
                        </div>
                    </div>
                )}

                {isLoading && <div className="mt-8">Loading…</div>}
                {error && <div className="mt-8 text-red-600">{String(error?.message || error)}</div>}

                {!isLoading && !error && me && mine.length > 0 && (
                    <div className="mt-8 flex flex-wrap justify-evenly gap-y-10">
                        {mine.map((l: any) => (
                            <ListingsCard
                                key={String(l.id ?? l._id ?? Math.random())}
                                id={String(l.id ?? l._id ?? "")}
                                title={String(l.title ?? l.name ?? "Untitled")}
                                author={String(
                                    l.user ??
                                        l.author ??
                                        l.owner ??
                                        l.createdBy ??
                                        (l.user?.username ??
                                            (typeof l.user?.email === "string" && l.user.email.includes("@")
                                                ? l.user.email.split("@")[0]
                                                : undefined)) ??
                                        "Unknown"
                                )}
                                price={
                                    typeof l.price === "number"
                                        ? `$${(l.price / 100).toFixed(2)}`
                                        : String(l.price ?? "")
                                }
                                roommates={String(l.roommates ?? "")}
                                body={String(l.body ?? l.description ?? "")}
                                location={String(l.location ?? "")}
                                moveInStart={String(l.moveInStart ?? "")}
                                moveInEnd={String(l.moveInEnd ?? "")}
                                status={toListingStatus(l.status)}
                                widthClass="w-120"
                                saveEnabled={false}
                                />
                        ))}
                    </div>
                )}

                {!isLoading && !error && me && mine.length === 0 && (
                    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg max-w-3xl">
                        <h2 className="text-2xl font-roboto-bold mb-2">No personal listings found</h2>
                        <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
                        <Link to="/create-listing" className="px-4 py-2 bg-black text-white rounded-3xl">Create a new listing</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

