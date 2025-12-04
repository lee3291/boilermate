import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ListingsCard from "../ListingsCard";
import { useAuth } from "../../../../contexts/AuthContext";
import useSWR from "swr";
import { fetcher } from "../../../../services/listingsFetcher";
import { Link } from "react-router-dom";
import ReviewListingsModal from "./ReviewListingsModal";
import ResolveListingsModal from "./ResolveListingsModal";

type ListingStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

function toListingStatus(v: unknown): ListingStatus {
    const u = String(v ?? "ACTIVE").toUpperCase();
    return u === "ACTIVE" || u === "INACTIVE" || u === "ARCHIVED"
        ? (u as ListingStatus)
        : "ACTIVE";
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

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function apiUrl(path: string) {
    return `${API_BASE_URL}${path}`;
}

async function deleteListing(listingId: string) {
    const path = `/listings/${encodeURIComponent(listingId)}`;
    const url = apiUrl(path);

    console.log("[MyListings] deleteListing() called", {
        listingId,
        path,
        url,
    });

    const res = await fetch(url, {
        method: "DELETE",
    });

    const rawText = await res.text();
    console.log("[MyListings] deleteListing() response", {
        status: res.status,
        statusText: res.statusText,
        url,
        rawText,
    });

    if (!res.ok) {
        let msg = `Failed to delete the listing (${res.status})`;
        try {
            const data = rawText ? JSON.parse(rawText) : null;
            if (data?.message) {
                msg =
                    typeof data.message === "string"
                        ? data.message
                        : JSON.stringify(data.message);
            }
        } catch {
        }
        throw new Error(msg);
    }

    try {
        return rawText ? JSON.parse(rawText) : null;
    } catch {
        return null;
    }
}

export default function MyListings() {
    const { user: authUser } = useAuth();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const { data, error, isLoading, mutate } = useSWR(
        apiUsername
            ? `/listings/users/${encodeURIComponent(apiUsername)}/listings`
            : null,
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

    const listingsNeedingReview = useMemo(
        () =>
            mine.filter(
                (l: any) => l?.moveInDateOutdatedAlert || l?.reportedOutdatedAlert
            ),
        [mine]
    );

    const handleOpenReviewModal = () => setIsReviewModalOpen(true);
    const handleCloseReviewModal = () => setIsReviewModalOpen(false);

    const handleResolveIssues = () => {
        setIsReviewModalOpen(false);
        setIsResolveModalOpen(true);
    };

    const handleCloseResolveModal = () => setIsResolveModalOpen(false);

    const handleResolveFlowCompleted = async () => {
        await mutate();
    };

    const toggleViewMode = () => {
        setViewMode((prev) => (prev === "cards" ? "table" : "cards"));
        setSelectedIds([]);
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const allIds = useMemo(
        () =>
            mine
                .map((l: any) => String(l.id ?? l._id ?? ""))
                .filter((id: string) => !!id),
        [mine]
    );

    const allSelected =
        allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedIds.length) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} listing(s)? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            setIsDeleting(true);
            await Promise.all(selectedIds.map((id) => deleteListing(id)));
            setSelectedIds([]);
            await mutate();
        } catch (err: any) {
            console.error("[MyListings] handleDeleteSelected() error", err);
            window.alert(
                err?.message ||
                    "Something went wrong while deleting listings. Please try again."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (l: any) => {
        if (typeof l.price === "number") {
            return `$${(l.price / 100).toFixed(2)}`;
        }
        return String(l.price ?? "");
    };

    const formatAuthor = (l: any) => {
        return String(
            l.user ??
                l.author ??
                l.owner ??
                l.createdBy ??
                (l.user?.username ??
                    (typeof l.user?.email === "string" &&
                    l.user.email.includes("@")
                        ? l.user.email.split("@")[0]
                        : undefined)) ??
                "Unknown"
        );
    };

    return (
        <div className="h-full w-full min-h-screen">
            <Navbar />
            <div className="mt-5 pl-16 pr-16">
                <div className="flex items-center justify-between">
                    <h1 className="font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-tight">
                        Personal Listings
                    </h1>

                    <div className="flex items-center gap-3">
                        {me && mine.length > 0 && (
                            <Link
                                to="/rommateapplications"
                                className="h-11 px-6 border border-black rounded-3xl bg-black text-white hover:bg-gray-900 transition font-roboto-light text-[16px] flex items-center justify-center"
                            >
                                Roommate applications
                            </Link>
                        )}

                        {me && mine.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleViewMode}
                                className="h-11 px-6 border border-black rounded-3xl bg-white hover:bg-gray-100 transition font-roboto-light text-[16px]"
                            >
                                {viewMode === "cards" ? "Select" : "Done"}
                            </button>
                        )}
                    </div>
                </div>

                {hasOutdatedListings && (
                    <div className="pt-4 flex justify-center">
                        <div className="h-18 w-[1500px] bg-yellow-100 rounded-[15px] border-2 border-amber-300">
                            <div className="pt-[10px] px-5 flex justify-between items-center">
                                <h2 className="font-sourceserif4-18pt-regular text-[30px] text-yellow-700">
                                    ALERT
                                </h2>
                                <p className="font-roboto-light text-[20px] text-yellow-700">
                                    There are some listings that have been modified and require
                                    your action
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
                        <h2 className="text-2xl font-roboto-bold mb-2">
                            You're not signed in
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sign in to see your personal listings.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-black text-white rounded-3xl"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/create-listing"
                                className="px-4 py-2 border border-black rounded-3xl"
                            >
                                Create a listing
                            </Link>
                        </div>
                    </div>
                )}

                {isLoading && <div className="mt-8">Loading…</div>}
                {error && (
                    <div className="mt-8 text-red-600">
                        {String(error?.message || error)}
                    </div>
                )}

                {!isLoading &&
                    !error &&
                    me &&
                    mine.length > 0 &&
                    viewMode === "cards" && (
                        <div className="mt-8 flex flex-wrap justify-evenly gap-y-10">
                            {mine.map((l: any) => (
                                <ListingsCard
                                    key={String(l.id ?? l._id ?? Math.random())}
                                    id={String(l.id ?? l._id ?? "")}
                                    title={String(l.title ?? l.name ?? "Untitled")}
                                    author={formatAuthor(l)}
                                    price={formatPrice(l)}
                                    roommates={String(l.roommates ?? "")}
                                    body={String(l.body ?? l.description ?? "")}
                                    location={String(l.location ?? "")}
                                    moveInStart={String(l.moveInStart ?? "")}
                                    moveInEnd={String(l.moveInEnd ?? "")}
                                    status={toListingStatus(l.status)}
                                    widthClass="w-120"
                                    saveEnabled={false}
                                    hasDescriptionAlert={!!l.reportedOutdatedAlert}
                                />
                            ))}
                        </div>
                    )}

                {!isLoading &&
                    !error &&
                    me &&
                    mine.length > 0 &&
                    viewMode === "table" && (
                        <div className="mt-8">
                            <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={allSelected}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Title
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Roommates
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Move-in
                                            </th>
                                            <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mine.map((l: any) => {
                                            const idStr = String(l.id ?? l._id ?? "");
                                            const isSelected = selectedIds.includes(idStr);
                                            return (
                                                <tr
                                                    key={idStr || Math.random()}
                                                    className="border-t border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleSelectOne(idStr)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {String(
                                                            l.title ?? l.name ?? "Untitled"
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {formatPrice(l)}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {String(l.roommates ?? "")}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {String(l.location ?? "")}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {String(l.moveInStart ?? "")}
                                                        {l.moveInEnd
                                                            ? ` – ${String(l.moveInEnd)}`
                                                            : ""}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {toListingStatus(l.status)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600 font-roboto-light">
                                    {selectedIds.length
                                        ? `${selectedIds.length} listing(s) selected`
                                        : "No listings selected"}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    disabled={!selectedIds.length || isDeleting}
                                    className={`px-5 py-2 rounded-3xl border text-sm font-roboto-light ${
                                        !selectedIds.length || isDeleting
                                            ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                            : "border-red-500 text-red-600 bg-white hover:bg-red-50"
                                    }`}
                                >
                                    {isDeleting ? "Deleting…" : "Delete selected"}
                                </button>
                            </div>
                        </div>
                    )}

                {!isLoading && !error && me && mine.length === 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-roboto-light mb-2">
                            No personal listings found
                        </h2>
                        <p className="text-gray-600 mb-4">
                            You haven't created any listings yet.
                        </p>
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

