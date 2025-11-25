import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ListingsCard from "../ListingsCard";
import { useAuth } from "../../../../contexts/AuthContext";
import useSWR from "swr";
import { fetcher } from "../../../../services/listingsFetcher";
import { Link } from "react-router-dom";
import ReviewListingsModal from "./ReviewListingsModal"; // <-- existing
import ResolveListingsModal from "./ResolveListingsModal"; // <-- NEW

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
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false); // <-- NEW

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

    const { data, error, isLoading, mutate } = useSWR( // <-- mutate added
        apiUsername ? `/listings/users/${encodeURIComponent(apiUsername)}/listings` : null,
        fetcher
    );

    const mine = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const hasMoveInDateIssues = useMemo(
        () => mine.some((l: any) => l?.moveInDateOutdatedAlert),
        [mine]
    );

    const hasDescriptionIssues = useMemo(
        () => mine.some((l: any) => l?.reportedOutdatedAlert),
        [mine]
    );

    const hasOutdatedListings = hasMoveInDateIssues || hasDescriptionIssues;

    // NEW: all listings that need to be resolved
    const listingsNeedingReview = useMemo(
        () =>
            mine.filter(
                (l: any) => l?.moveInDateOutdatedAlert || l?.reportedOutdatedAlert
            ),
        [mine]
    );

    const handleOpenReviewModal = () => {
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
    };

    const handleResolveIssues = () => {
        // open resolve flow and close the initial info modal
        setIsReviewModalOpen(false);
        setIsResolveModalOpen(true);
    };

    const handleCloseResolveModal = () => {
        setIsResolveModalOpen(false);
    };

    const handleResolveFlowCompleted = async () => {
        // refresh listings after resolving
        await mutate();
    };

    return (
        <div className="h-full w-full min-h-screen">
            <Navbar />
            <div className="mt-5 pl-16 pr-16">
                <h1 className="font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-tight">
                    Personal Listings
                </h1>

                {hasOutdatedListings && (
                    <div className="pt-4 flex justify-center">
                        <div className="h-18 w-[1500px] bg-yellow-100 rounded-[15px] border-2 border-amber-300">
                            <div className="pt-[10px] px-5 flex justify-between items-center">
                                <h2 className="font-sourceserif4-18pt-regular text-[30px] text-yellow-700">ALERT</h2>
                                <p className="font-roboto-light text-[20px] text-yellow-700">
                                    There are some listings that have been modified and require your action
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenReviewModal}
                                    className="cursor-pointer h-12 px-4 flex justify-center items-center border-yellow-300 border-2 bg-yellow-50 rounded-[10px] hover:bg-white"
                                >
                                    <p className="font-roboto-light text-[18px] text-yellow-700">
                                        REVIEW
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                    <div className="mt-8">
                        <h2 className="text-2xl font-roboto-light mb-2">No personal listings found</h2>
                        <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
                    </div>
                )}
            </div>

            <ReviewListingsModal
                isOpen={isReviewModalOpen}
                onClose={handleCloseReviewModal}
                onResolve={handleResolveIssues}
                hasMoveInDateIssues={hasMoveInDateIssues}
                hasDescriptionIssues={hasDescriptionIssues}
            />

            <ResolveListingsModal
                isOpen={isResolveModalOpen}
                onClose={handleCloseResolveModal}
                onCompleted={handleResolveFlowCompleted}
                listings={listingsNeedingReview}
            />
        </div>
    );
}

