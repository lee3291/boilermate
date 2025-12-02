import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../../../contexts/AuthContext";
import { Link } from "react-router-dom";

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

type ListingMeta = {
    id: string;
    title: string;
    ownerUsername: string | null;
    ownerEmail: string | null;
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

export default function Dashboard() {
    const { user: authUser } = useAuth();

    const [applications, setApplications] = useState<RoommateApplication[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

    // listing meta (title, owner username/email) keyed by listingId
    const [listingMetaById, setListingMetaById] = useState<Record<string, ListingMeta>>(
        {},
    );
    const [listingMetaLoading, setListingMetaLoading] = useState<
        Record<string, boolean>
    >({});

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

    const apiApplicantId = useMemo(() => {
        if (!me) return null;
        return me.username ?? me.emailLocal ?? me.id ?? null;
    }, [me]);

    useEffect(() => {
        if (!apiApplicantId) return;

        const applicantId: string = apiApplicantId; // non-null snapshot for this effect
        let cancelled = false;
        const controller = new AbortController();

        async function loadApplications(currentApplicantId: string) {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            params.set("page", "1");
            params.set("pageSize", "50");

            const path = `/listings/users/${encodeURIComponent(
                currentApplicantId,
            )}/roommate-applications?${params.toString()}`;
            const url = apiUrl(path);

            try {
                const res = await fetch(url, { signal: controller.signal });
                const raw = await res.text();

                if (!res.ok) {
                    let msg = `Failed to load applications (${res.status})`;
                    try {
                        const data = raw ? JSON.parse(raw) : null;
                        if (data?.message) {
                            msg =
                                typeof data.message === "string"
                                    ? data.message
                                    : JSON.stringify(data.message);
                        }
                    } catch {
                        // ignore parse error
                    }
                    throw new Error(msg);
                }

                if (cancelled) return;
                const data = raw ? JSON.parse(raw) : null;
                const apps = Array.isArray(data?.applications)
                    ? (data.applications as RoommateApplication[])
                    : [];
                setApplications(apps);
            } catch (err: any) {
                if (cancelled || err?.name === "AbortError") return;
                console.error("[ApplicationsDashboard] loadApplications error", err);
                setError(
                    err?.message ||
                        "Something went wrong while loading applications. Please try again.",
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadApplications(applicantId);

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [apiApplicantId, statusFilter]);

    // load listing meta (title + owner + email) for each listingId
    const loadListingMeta = async (listingId: string) => {
        if (!listingId) return;
        if (listingMetaById[listingId] || listingMetaLoading[listingId]) return;

        setListingMetaLoading((prev) => ({ ...prev, [listingId]: true }));

        try {
            // 1) Get listing details
            const listingRes = await fetch(
                apiUrl(`/listings/${encodeURIComponent(listingId)}`),
            );
            const listingRaw = await listingRes.text();

            let title = `Listing ${listingId}`;
            let ownerUsername: string | null = null;
            let ownerEmail: string | null = null;

            if (listingRes.ok) {
                try {
                    const listing = listingRaw ? JSON.parse(listingRaw) : null;
                    if (listing) {
                        if (typeof listing.title === "string" && listing.title.trim()) {
                            title = listing.title.trim();
                        }
                        if (typeof listing.user === "string" && listing.user.trim()) {
                            ownerUsername = listing.user.trim();
                        }
                    }
                } catch (e) {
                    console.error(
                        "[ApplicationsDashboard] failed to parse listing detail",
                        e,
                    );
                }
            }

            // 2) Resolve owner email from ownerUsername (email prefix)
            if (ownerUsername) {
                try {
                    const searchRes = await fetch(
                        apiUrl(
                            `/profile/search-by-id?emailPrefix=${encodeURIComponent(
                                ownerUsername,
                            )}`,
                        ),
                    );
                    const searchRaw = await searchRes.text();
                    if (searchRes.ok) {
                        const json = searchRaw ? JSON.parse(searchRaw) : null;

                        let users: any[] = [];
                        if (Array.isArray(json)) users = json;
                        else if (Array.isArray(json?.users)) users = json.users;
                        else if (Array.isArray(json?.results)) users = json.results;
                        else if (json && typeof json === "object") users = [json];

                        if (users.length > 0) {
                            const targetPrefix = ownerUsername.toLowerCase();
                            let matched: any | null = null;

                            for (const u of users) {
                                const emailCandidate =
                                    typeof u?.email === "string"
                                        ? u.email
                                        : typeof u?.emailAddress === "string"
                                        ? u.emailAddress
                                        : typeof u?.primaryEmail === "string"
                                        ? u.primaryEmail
                                        : null;
                                if (!emailCandidate) continue;

                                const lp = emailLocalPart(emailCandidate)?.toLowerCase();
                                if (lp && lp === targetPrefix) {
                                    matched = u;
                                    break;
                                }
                            }

                            if (!matched) matched = users[0];

                            const emailCandidate =
                                typeof matched?.email === "string"
                                    ? matched.email
                                    : typeof matched?.emailAddress === "string"
                                    ? matched.emailAddress
                                    : typeof matched?.primaryEmail === "string"
                                    ? matched.primaryEmail
                                    : null;

                            if (emailCandidate && typeof emailCandidate === "string") {
                                ownerEmail = emailCandidate;
                            }
                        }
                    }
                } catch (e) {
                    console.error(
                        "[ApplicationsDashboard] failed to resolve owner email",
                        e,
                    );
                }
            }

            setListingMetaById((prev) => ({
                ...prev,
                [listingId]: {
                    id: listingId,
                    title,
                    ownerUsername,
                    ownerEmail,
                },
            }));
        } catch (e) {
            console.error("[ApplicationsDashboard] loadListingMeta error", e);
        } finally {
            setListingMetaLoading((prev) => ({ ...prev, [listingId]: false }));
        }
    };

    // ensure we fetch meta for each listingId referenced in applications
    useEffect(() => {
        const ids = new Set(applications.map((a) => a.listingId));
        ids.forEach((id) => {
            if (id && !listingMetaById[id] && !listingMetaLoading[id]) {
                void loadListingMeta(id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applications, listingMetaById, listingMetaLoading]);

    const handleWithdraw = async (id: string) => {
        const app = applications.find((a) => a.id === id);
        if (!app || app.status !== "PENDING") return;

        const confirmed = window.confirm(
            "Are you sure you want to withdraw this application?",
        );
        if (!confirmed) return;

        const path = `/listings/roommate-applications/${encodeURIComponent(
            id,
        )}/withdraw`;
        const url = apiUrl(path);

        try {
            setWithdrawingId(id);
            setError(null);

            const res = await fetch(url, { method: "POST" });
            const raw = await res.text();

            if (!res.ok) {
                let msg = `Failed to withdraw application (${res.status})`;
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

            const updated = raw ? (JSON.parse(raw) as RoommateApplication) : null;
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === id && updated
                        ? {
                                ...a,
                                status: updated.status,
                                decidedAt: updated.decidedAt ?? a.decidedAt,
                                updatedAt: updated.updatedAt ?? a.updatedAt,
                            }
                        : a,
                ),
            );
        } catch (err: any) {
            console.error("[ApplicationsDashboard] handleWithdraw error", err);
            setError(
                err?.message ||
                    "Something went wrong while withdrawing. Please try again.",
            );
        } finally {
            setWithdrawingId(null);
        }
    };

    const hasApplications = applications.length > 0;

    return (
        <div className="h-full w-full min-h-screen">
            <Navbar />
            <div className="mt-5 pl-16 pr-16">
                <div className="flex items-center justify-between">
                    <h1 className="font-sourceserif4-18pt-regular text-maingray text-[55px] tracking-tight">
                        Ongoing Applications
                    </h1>
                </div>

                {!authUser && (
                    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg max-w-3xl">
                        <h2 className="text-2xl font-roboto-bold mb-2">
                            You&apos;re not signed in
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sign in to see your roommate applications.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-black text-white rounded-3xl"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                )}

                {authUser && (
                    <>
                        {/* status filter row */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {(
                                [
                                    "ALL",
                                    "PENDING",
                                    "ACCEPTED",
                                    "REJECTED",
                                    "WITHDRAWN",
                                ] as StatusFilter[]
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

                        {isLoading && <div className="mt-8">Loading…</div>}

                        {error && (
                            <div className="mt-8 text-red-600">
                                {String(error || "")}
                            </div>
                        )}

                        {!isLoading && !error && authUser && !hasApplications && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-roboto-light mb-2">
                                    No applications found
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    You haven&apos;t applied to any listings
                                    {statusFilter !== "ALL"
                                        ? ` with status “${statusFilter}”`
                                        : ""}{" "}
                                    yet.
                                </p>
                            </div>
                        )}

                        {!isLoading && !error && hasApplications && (
                            <div className="mt-8">
                                <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700">
                                                    Listing / Owner
                                                </th>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700">
                                                    Applied
                                                </th>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700">
                                                    Last update
                                                </th>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700">
                                                    Message
                                                </th>
                                                <th className="px-4 py-3 text-sm font-roboto-regular text-gray-700 text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => {
                                                const meta =
                                                    listingMetaById[app.listingId];
                                                const metaIsLoading =
                                                    listingMetaLoading[app.listingId];

                                                return (
                                                    <tr
                                                        key={app.id}
                                                        className="border-t border-gray-100 hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                            {meta ? (
                                                                <div className="space-y-1">
                                                                    <div className="font-roboto-medium text-gray-900">
                                                                        {meta.title}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 font-roboto-light">
                                                                        {meta.ownerUsername
                                                                            ? `Owner: ${meta.ownerUsername}`
                                                                            : "Owner: —"}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 font-roboto-light">
                                                                        {meta.ownerEmail ? (
                                                                            <a
                                                                                href={`mailto:${meta.ownerEmail}`}
                                                                                className="underline underline-offset-2"
                                                                            >
                                                                                {
                                                                                    meta.ownerEmail
                                                                                }
                                                                            </a>
                                                                        ) : (
                                                                                "Email: —"
                                                                            )}
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <Link
                                                                            to={`/listings/${meta.id}`}
                                                                            state={{
                                                                                id: meta.id,
                                                                                title: meta.title,
                                                                            }}
                                                                            className="text-gray-500 hover:underline underline-offset-2 font-roboto-light"
                                                                        >
                                                                            View listing
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ) : metaIsLoading ? (
                                                                    <span className="text-xs text-gray-500">
                                                                        Loading listing…
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        Listing {app.listingId}
                                                                    </span>
                                                                )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 align-top">
                                                            {app.status}
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
                                                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs align-top">
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
                                                        <td className="px-4 py-2 text-sm text-gray-900 text-right align-top">
                                                            {app.status === "PENDING" ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleWithdraw(
                                                                            app.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        withdrawingId ===
                                                                            app.id
                                                                    }
                                                                    className={`px-4 py-2 rounded-3xl border text-sm font-roboto-light ${
                                                                        withdrawingId ===
                                                                            app.id
                                                                            ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                            : "border-red-500 text-red-600 bg-white hover:bg-red-50"
                                                                    }`}
                                                                >
                                                                    {withdrawingId ===
                                                                        app.id
                                                                        ? "Withdrawing…"
                                                                        : "Withdraw"}
                                                                </button>
                                                            ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        No actions
                                                                    </span>
                                                                )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="mt-4 text-sm text-gray-600 font-roboto-light">
                                    Showing {applications.length} application
                                    {applications.length === 1 ? "" : "s"}
                                    {statusFilter !== "ALL"
                                        ? ` with status “${statusFilter}”.`
                                        : "."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

