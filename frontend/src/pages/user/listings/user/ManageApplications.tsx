import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../../../contexts/AuthContext";
import useSWR from "swr";
import { fetcher } from "../../../../services/listingsFetcher";

type ListingStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type RoommateApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type RoommateApplication = {
    id: string;
    listingId: string;
    applicantId: string;
    status: RoommateApplicationStatus;
    message: string | null;
    preferenceSnapshot: any | null;
    decidedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

type StatusFilter = "ALL" | RoommateApplicationStatus;

type ListingWithApplications = {
    listingId: string;
    title: string;
    location: string;
    roommates: string;
    status: ListingStatus;
    moveInStart?: string | null;
    moveInEnd?: string | null;
    applications: RoommateApplication[];
};

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function apiUrl(path: string) {
    return `${API_BASE_URL}${path}`;
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

function formatDate(value: string | null | undefined) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function toListingStatus(v: unknown): ListingStatus {
    const u = String(v ?? "ACTIVE").toUpperCase();
    return u === "ACTIVE" || u === "INACTIVE" || u === "ARCHIVED"
        ? (u as ListingStatus)
        : "ACTIVE";
}

export default function ManageRoommateApplications() {
    const { user: authUser } = useAuth();

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
    const [applicationsByListing, setApplicationsByListing] = useState<
        ListingWithApplications[]
    >([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [appsError, setAppsError] = useState<string | null>(null);
    const [savingStatusById, setSavingStatusById] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedAppIds, setExpandedAppIds] = useState<string[]>([]);

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

    // Load all listings owned by the current user (same as MyListings)
    const { data, error, isLoading } = useSWR(
        apiUsername
            ? `/listings/users/${encodeURIComponent(apiUsername)}/listings`
            : null,
        fetcher,
    );

    const mine = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    useEffect(() => {
        if (!apiUsername) {
            setApplicationsByListing([]);
            return;
        }
        if (!mine || !Array.isArray(mine) || mine.length === 0) {
            setApplicationsByListing([]);
            return;
        }

        let cancelled = false;

        async function loadApplications() {
            setAppsLoading(true);
            setAppsError(null);

            try {
                const results: ListingWithApplications[] = [];

                for (const l of mine) {
                    const listingId = String(l.id ?? l._id ?? "");
                    if (!listingId) continue;

                    const params = new URLSearchParams();
                    if (statusFilter !== "ALL") {
                        params.set("status", statusFilter);
                    }
                    params.set("page", "1");
                    params.set("pageSize", "50");

                    const path = `/listings/${encodeURIComponent(
                        listingId,
                    )}/roommate-applications?${params.toString()}`;
                    const url = apiUrl(path);

                    try {
                        const res = await fetch(url);
                        const raw = await res.text();

                        if (!res.ok) {
                            // If this listing has an issue, skip it but keep going
                            console.error(
                                "[ManageRoommateApplications] failed to load apps for listing",
                                listingId,
                                res.status,
                            );
                            continue;
                        }

                        const json = raw ? JSON.parse(raw) : null;
                        const apps: RoommateApplication[] = Array.isArray(
                            json?.applications,
                        )
                            ? json.applications
                            : [];

                        if (!apps.length) continue;

                        results.push({
                            listingId,
                            title: String(l.title ?? l.name ?? "Untitled"),
                            location: String(l.location ?? ""),
                            roommates: String(l.roommates ?? ""),
                            status: toListingStatus(l.status),
                            moveInStart:
                                typeof l.moveInStart === "string"
                                    ? l.moveInStart
                                    : undefined,
                            moveInEnd:
                                typeof l.moveInEnd === "string"
                                    ? l.moveInEnd
                                    : undefined,
                            applications: apps,
                        });
                    } catch (err) {
                        console.error(
                            "[ManageRoommateApplications] error loading apps for listing",
                            listingId,
                            err,
                        );
                        continue;
                    }
                }

                if (cancelled) return;
                setApplicationsByListing(results);
            } catch (err: any) {
                if (cancelled) return;
                console.error("[ManageRoommateApplications] loadApplications error", err);
                setAppsError(
                    err?.message ||
                        "Something went wrong while loading roommate applications.",
                );
            } finally {
                if (!cancelled) setAppsLoading(false);
            }
        }

        loadApplications();

        return () => {
            cancelled = true;
        };
    }, [apiUsername, mine, statusFilter]);

    const toggleExpanded = (applicationId: string) => {
        setExpandedAppIds((prev) =>
            prev.includes(applicationId)
                ? prev.filter((id) => id !== applicationId)
                : [...prev, applicationId],
        );
    };

    const handleUpdateApplicationStatus = async (
        applicationId: string,
        nextStatus: RoommateApplicationStatus,
    ) => {
        setSavingStatusById((prev) => ({ ...prev, [applicationId]: true }));

        const path = `/listings/roommate-applications/${encodeURIComponent(
            applicationId,
        )}/status`;
        const url = apiUrl(path);

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const raw = await res.text();

            if (!res.ok) {
                let msg = `Failed to update application status (${res.status})`;
                try {
                    const data = raw ? JSON.parse(raw) : null;
                    if (data?.message) {
                        msg =
                            typeof data.message === "string"
                                ? data.message
                                : JSON.stringify(data.message);
                    }
                } catch {
                    // ignore
                }
                throw new Error(msg);
            }

            const updated: RoommateApplication = raw ? JSON.parse(raw) : null;

            // Update local state
            setApplicationsByListing((prev) =>
                prev.map((listing) => ({
                    ...listing,
                    applications: listing.applications.map((app) =>
                        app.id === applicationId
                            ? {
                                  ...app,
                                  status: updated?.status ?? nextStatus,
                                  decidedAt: updated?.decidedAt ?? app.decidedAt,
                                  updatedAt: updated?.updatedAt ?? app.updatedAt,
                              }
                            : app,
                    ),
                })),
            );
        } catch (err: any) {
            console.error(
                "[ManageRoommateApplications] handleUpdateApplicationStatus error",
                err,
            );
            alert(
                err?.message ||
                    "Could not update application status. Please try again.",
            );
        } finally {
            setSavingStatusById((prev) => ({ ...prev, [applicationId]: false }));
        }
    };

    const hasAnyApplications = applicationsByListing.some(
        (l) => l.applications && l.applications.length > 0,
    );

    const renderPreferenceSnapshot = (snapshot: any) => {
        if (!snapshot) {
            return <p className="text-sm text-gray-500">No preferences available.</p>;
        }

        if (typeof snapshot !== "object") {
            return (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {String(snapshot)}
                </pre>
            );
        }

        // Simple key/value listing, styled lightly
        const entries = Object.entries(snapshot);
        if (!entries.length) {
            return (
                <p className="text-sm text-gray-500">
                    Preferences object is empty for this user.
                </p>
            );
        }

        return (
            <div className="space-y-1">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex text-sm">
                        <div className="w-40 text-gray-500 font-roboto-medium pr-2">
                            {key}
                        </div>
                        <div className="flex-1 text-gray-800 font-roboto-light">
                            {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const statusPill = (status: RoommateApplicationStatus) => {
        let cls =
            "inline-flex items-center rounded-3xl border px-3 py-1 text-xs font-roboto-medium ";
        if (status === "PENDING") {
            cls += "border-yellow-400 bg-yellow-50 text-yellow-800";
        } else if (status === "ACCEPTED") {
            cls += "border-green-500 bg-green-50 text-green-700";
        } else if (status === "REJECTED") {
            cls += "border-red-500 bg-red-50 text-red-700";
        } else {
            cls += "border-gray-300 bg-gray-50 text-gray-600";
        }
        return <span className={cls}>{status}</span>;
    };

    return (
        <div className="h-full w-full min-h-screen">
            <Navbar />
            <div className="mt-5 pl-16 pr-16">
                <div className="flex items-center justify-between">
                    <h1 className="font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-tight">
                        Roommate applications
                    </h1>
                </div>

                {!authUser && (
                    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg max-w-3xl">
                        <h2 className="text-2xl font-roboto-bold mb-2">
                            You&apos;re not signed in
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sign in to review applications for your listings.
                        </p>
                    </div>
                )}

                {authUser && (
                    <>
                        {/* Filter row */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {(
                                ["ALL", "PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as StatusFilter[]
                            ).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatusFilter(s)}
                                    className={`h-9 px-4 rounded-3xl border text-sm font-roboto-light transition ${
                                        statusFilter === s
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    {s === "ALL" ? "All" : s}
                                </button>
                            ))}
                        </div>

                        {(isLoading || appsLoading) && (
                            <div className="mt-8 text-gray-700">Loading…</div>
                        )}

                        {(error || appsError) && (
                            <div className="mt-8 text-red-600">
                                {String(error?.message || error || appsError || "")}
                            </div>
                        )}

                        {!isLoading &&
                            !appsLoading &&
                            authUser &&
                            !hasAnyApplications && (
                                <div className="mt-8">
                                    <h2 className="text-2xl font-roboto-light mb-2">
                                        No applications yet
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        None of your listings have roommate applications
                                        {statusFilter !== "ALL"
                                            ? ` with status “${statusFilter}”`
                                            : ""}{" "}
                                        at the moment.
                                    </p>
                                </div>
                            )}

                        {!isLoading &&
                            !appsLoading &&
                            hasAnyApplications &&
                            applicationsByListing.map((listing) => (
                                <div
                                    key={listing.listingId}
                                    className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                >
                                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-roboto-regular text-gray-900">
                                                {listing.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 font-roboto-light">
                                                {listing.location || "Unknown location"} · Looking
                                                for {listing.roommates || "?"} roommate(s)
                                                {listing.moveInStart
                                                    ? ` · Move-in: ${listing.moveInStart}${
                                                          listing.moveInEnd
                                                              ? ` – ${listing.moveInEnd}`
                                                              : ""
                                                      }`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 font-roboto-light">
                                            Status:{" "}
                                            <span className="font-roboto-medium">
                                                {listing.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 overflow-x-auto">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                        Applicant
                                                    </th>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                        Applied
                                                    </th>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                        Last update
                                                    </th>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700">
                                                        Message
                                                    </th>
                                                    <th className="px-4 py-3 text-sm font-roboto-medium text-gray-700 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listing.applications.map((app) => {
                                                    const isExpanded = expandedAppIds.includes(
                                                        app.id,
                                                    );
                                                    const isSaving =
                                                        !!savingStatusById[app.id];
                                                    const canDecide =
                                                        app.status === "PENDING";

                                                    return (
                                                        <Fragment key={app.id}>
                                                            <tr className="border-t border-gray-100 hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                                    <div className="font-mono text-xs">
                                                                        {app.applicantId}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                                    {statusPill(app.status)}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                                    {formatDate(app.createdAt)}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                                    {formatDate(
                                                                        app.decidedAt ||
                                                                            app.updatedAt,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top max-w-xs">
                                                                    {app.message ? (
                                                                        <span className="line-clamp-2">
                                                                            {app.message}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 align-top text-right">
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                toggleExpanded(app.id)
                                                                            }
                                                                            className="text-xs text-gray-600 hover:text-black underline-offset-2 hover:underline font-roboto-light"
                                                                        >
                                                                            {isExpanded
                                                                                ? "Hide preferences"
                                                                                : "View preferences"}
                                                                        </button>

                                                                        <div className="flex gap-2 mt-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleUpdateApplicationStatus(
                                                                                        app.id,
                                                                                        "ACCEPTED",
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    !canDecide ||
                                                                                    isSaving
                                                                                }
                                                                                className={`px-3 py-1 rounded-3xl border text-xs font-roboto-light ${
                                                                                    !canDecide ||
                                                                                    isSaving
                                                                                        ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                                        : "border-green-500 text-green-700 bg-white hover:bg-green-50"
                                                                                }`}
                                                                            >
                                                                                {isSaving &&
                                                                                canDecide
                                                                                    ? "Saving…"
                                                                                    : "Accept"}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleUpdateApplicationStatus(
                                                                                        app.id,
                                                                                        "REJECTED",
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    !canDecide ||
                                                                                    isSaving
                                                                                }
                                                                                className={`px-3 py-1 rounded-3xl border text-xs font-roboto-light ${
                                                                                    !canDecide ||
                                                                                    isSaving
                                                                                        ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                                        : "border-red-500 text-red-600 bg-white hover:bg-red-50"
                                                                                }`}
                                                                            >
                                                                                {isSaving &&
                                                                                canDecide
                                                                                    ? "Saving…"
                                                                                    : "Reject"}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            {isExpanded && (
                                                                <tr className="border-t border-gray-100 bg-gray-50/60">
                                                                    <td
                                                                        colSpan={6}
                                                                        className="px-6 py-4"
                                                                    >
                                                                        <h3 className="text-sm font-roboto-medium text-gray-700 mb-2">
                                                                            Applicant preferences
                                                                        </h3>
                                                                        {renderPreferenceSnapshot(
                                                                            app.preferenceSnapshot,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                        {!isLoading &&
                            !appsLoading &&
                            hasAnyApplications && (
                                <p className="mt-6 text-sm text-gray-600 font-roboto-light">
                                    Showing roommate applications for{" "}
                                    {applicationsByListing.length} listing
                                    {applicationsByListing.length === 1 ? "" : "s"}
                                    {statusFilter !== "ALL"
                                        ? ` with status “${statusFilter}”.`
                                        : "."}
                                </p>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}

// React Fragment import (kept here to avoid modifying other imports at the top)
import { Fragment } from "react";

