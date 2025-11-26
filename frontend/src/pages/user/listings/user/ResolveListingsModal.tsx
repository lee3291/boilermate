import React, { useEffect, useMemo, useState } from "react";

interface ResolveListingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
    listings: any[]; // replace with your Listing type if you have one
}

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function apiUrl(path: string) {
    // path is like `/listings/:id`
    return `${API_BASE_URL}${path}`;
}

// Uses NestJS @Patch(':id') and @Delete(':id') on ListingsController
async function updateListing(listingId: string, payload: any) {
    const path = `/listings/${encodeURIComponent(listingId)}`;
    const url = apiUrl(path);

    console.log("[ResolveListingsModal] updateListing() called", {
        listingId,
        path,
        url,
        payload,
    });

    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    console.log("[ResolveListingsModal] updateListing() response", {
        status: res.status,
        statusText: res.statusText,
        url,
        rawText,
    });

    if (!res.ok) {
        let msg = `Failed to update listing (${res.status})`;
        try {
            const data = rawText ? JSON.parse(rawText) : null;
            if (data?.message) {
                msg =
                    typeof data.message === "string"
                        ? data.message
                        : JSON.stringify(data.message);
            }
        } catch {
            // ignore JSON parse errors, keep default msg
        }
        throw new Error(msg);
    }

    try {
        return rawText ? JSON.parse(rawText) : null;
    } catch {
        return null;
    }
}

async function deleteListing(listingId: string) {
    const path = `/listings/${encodeURIComponent(listingId)}`;
    const url = apiUrl(path);

    console.log("[ResolveListingsModal] deleteListing() called", {
        listingId,
        path,
        url,
    });

    const res = await fetch(url, {
        method: "DELETE",
    });

    const rawText = await res.text();
    console.log("[ResolveListingsModal] deleteListing() response", {
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
            // ignore JSON parse errors, keep default msg
        }
        throw new Error(msg);
    }

    try {
        return rawText ? JSON.parse(rawText) : null;
    } catch {
        return null;
    }
}

const ResolveListingsModal: React.FC<ResolveListingsModalProps> = ({
    isOpen,
    onClose,
    onCompleted,
    listings,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [description, setDescription] = useState("");
    const [moveInStart, setMoveInStart] = useState("");
    const [moveInEnd, setMoveInEnd] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const total = listings.length;

    const currentListing = useMemo(
        () => (total > 0 ? listings[currentIndex] : null),
        [listings, currentIndex, total]
    );

    const hasDescriptionIssue = !!currentListing?.reportedOutdatedAlert;
    const hasMoveInDateIssue = !!currentListing?.moveInDateOutdatedAlert;

    // Seed local form state whenever we switch listings
    useEffect(() => {
        if (!currentListing) return;

        console.log("[ResolveListingsModal] showing listing", {
            index: currentIndex,
            total,
            id: currentListing.id,
            hasDescriptionIssue,
            hasMoveInDateIssue,
            listing: currentListing,
        });

        setDescription(String(currentListing.description ?? ""));
        const startRaw = String(currentListing.moveInStart ?? "");
        const endRaw = String(currentListing.moveInEnd ?? "");
        setMoveInStart(startRaw ? startRaw.slice(0, 10) : "");
        setMoveInEnd(endRaw ? endRaw.slice(0, 10) : "");
        setError(null);
        setIsSubmitting(false);
    }, [currentListing, currentIndex, total, hasDescriptionIssue, hasMoveInDateIssue]);

    // Reset index when opening
    useEffect(() => {
        if (isOpen) {
            console.log("[ResolveListingsModal] opened with listings", listings);
            setCurrentIndex(0);
        }
    }, [isOpen, listings]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentIndex + 1 < total) {
            setCurrentIndex((idx) => idx + 1);
        } else {
            console.log("[ResolveListingsModal] all listings processed");
            onCompleted();
            onClose();
        }
    };

    const handleSave = async () => {
        if (!currentListing) return;
        setIsSubmitting(true);
        setError(null);

        const listingId = String(currentListing.id);
        const payload: any = {};

        if (hasDescriptionIssue) {
            payload.description = description;
            payload.reportedOutdatedAlert = false;
        }

        if (hasMoveInDateIssue) {
            payload.moveInStart = moveInStart || null;
            payload.moveInEnd = moveInEnd || null;
            payload.moveInDateOutdatedAlert = false;
        }

        console.log("[ResolveListingsModal] handleSave()", {
            listingId,
            payload,
        });

        try {
            await updateListing(listingId, payload);
            handleNext();
        } catch (err: any) {
            console.error("[ResolveListingsModal] handleSave() error", err);
            setError(err?.message || "Something went wrong while saving.");
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentListing) return;

        const listingId = String(currentListing.id);
        console.log("[ResolveListingsModal] handleDelete() clicked", {
            listingId,
            listing: currentListing,
        });

        const confirmed = window.confirm(
            "Are you sure you want to delete this listing? This action cannot be undone."
        );
        if (!confirmed) {
            console.log("[ResolveListingsModal] delete cancelled by user");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await deleteListing(listingId);
            handleNext();
        } catch (err: any) {
            console.error("[ResolveListingsModal] handleDelete() error", err);
            setError(err?.message || "Something went wrong while deleting.");
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        console.log("[ResolveListingsModal] review cancelled by user");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
                className="absolute inset-0"
                onClick={handleCancel}
                aria-hidden="true"
            />

            <div className="relative z-50 w-full max-w-2xl rounded-[20px] bg-yellow-50 border-2 border-amber-300 shadow-xl px-8 py-6">
                {total === 0 ? (
                    <>
                        <h2 className="font-sourceserif4-18pt-regular text-[32px] text-yellow-800 mb-3 tracking-tight">
                            No Listings to Review
                        </h2>
                        <p className="font-roboto-light text-[16px] text-gray-800 mb-6">
                            All flagged listings have already been resolved.
                        </p>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2 rounded-[10px] border border-gray-300 bg-white text-gray-800 font-roboto-light hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="font-sourceserif4-18pt-regular text-[30px] text-yellow-800 tracking-tight">
                                    Resolve Listing
                                </h2>
                                <p className="font-roboto-light text-[14px] text-gray-700 mt-1">
                                    Listing {currentIndex + 1} of {total}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[12px] border border-yellow-200 px-5 py-4 mb-4">
                            <div className="mb-3">
                                <p className="font-roboto-medium text-[16px] text-gray-900">
                                    {String(currentListing.title ?? "Untitled Listing")}
                                </p>
                                <p className="font-roboto-light text-[14px] text-gray-600">
                                    {String(currentListing.location ?? "")}
                                </p>
                            </div>

                            <ul className="list-disc pl-5 text-[14px] font-roboto-light text-gray-800 space-y-1 mb-3">
                                {hasDescriptionIssue && (
                                    <li>
                                        Description was{" "}
                                        <span className="font-roboto-medium">reported by users</span> as
                                        inaccurate, misleading, or outdated.
                                    </li>
                                )}
                                {hasMoveInDateIssue && (
                                    <li>
                                        Move-in dates appear{" "}
                                        <span className="font-roboto-medium">outdated or incorrect</span>.
                                    </li>
                                )}
                            </ul>

                            {hasDescriptionIssue && (
                                <div className="mb-4">
                                    <label className="block font-roboto-medium text-[14px] text-gray-800 mb-1">
                                        Listing Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-[10px] border border-gray-300 px-3 py-2 text-[14px] font-roboto-light text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                    <p className="mt-1 text-[12px] font-roboto-light text-gray-500">
                                        Update the description so it is accurate, clear, and up to date.
                                    </p>
                                </div>
                            )}

                            {hasMoveInDateIssue && (
                                <div className="mb-2">
                                    <label className="block font-roboto-medium text-[14px] text-gray-800 mb-1">
                                        Move-in Dates
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <span className="block text-[12px] font-roboto-light text-gray-600 mb-1">
                                                Start
                                            </span>
                                            <input
                                                type="date"
                                                value={moveInStart}
                                                onChange={(e) => setMoveInStart(e.target.value)}
                                                className="w-full rounded-[10px] border border-gray-300 px-3 py-2 text-[14px] font-roboto-light text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-[12px] font-roboto-light text-gray-600 mb-1">
                                                End
                                            </span>
                                            <input
                                                type="date"
                                                value={moveInEnd}
                                                onChange={(e) => setMoveInEnd(e.target.value)}
                                                className="w-full rounded-[10px] border border-gray-300 px-3 py-2 text-[14px] font-roboto-light text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-[12px] font-roboto-light text-gray-500">
                                        Set accurate dates so renters know when the place is available.
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="mb-3 text-[13px] font-roboto-light text-red-600">
                                {error}
                            </p>
                        )}

                        <p className="font-roboto-light text-[13px] text-gray-700 mb-4">
                            You can either{" "}
                            <span className="font-roboto-medium">update this listing</span> or{" "}
                            <span className="font-roboto-medium">delete it</span>. Deleting will remove the
                            listing and mark this report as resolved.
                        </p>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-[10px] border border-gray-300 bg-white text-gray-800 font-roboto-light hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancel review
                            </button>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-[10px] border border-red-300 bg-white text-red-600 font-roboto-light hover:bg-red-50 disabled:opacity-60"
                                >
                                    Delete listing
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 rounded-[10px] bg-yellow-500 text-white font-roboto-medium hover:bg-yellow-600 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Saving..." : "Save & continue"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResolveListingsModal;

