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

        let cancelled = false;
        const controller = new AbortController();

        async function loadApplications() {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            params.set("page", "1");
            params.set("pageSize", "50");

            const path = `/listings/users/${encodeURIComponent(
                apiApplicantId
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
                        "Something went wrong while loading applications. Please try again."
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadApplications();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [apiApplicantId, statusFilter]);

    const handleWithdraw = async (id: string) => {
        const app = applications.find((a) => a.id === id);
        if (!app || app.status !== "PENDING") return;

        const confirmed = window.confirm(
            "Are you sure you want to withdraw this application?"
        );
        if (!confirmed) return;

        const path = `/listings/roommate-applications/${encodeURIComponent(
            id
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
                        : a
                )
            );
        } catch (err: any) {
            console.error("[ApplicationsDashboard] handleWithdraw error", err);
            setError(
                err?.message ||
                    "Something went wrong while withdrawing. Please try again."
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
                        {/* status filter row, styled similarly to other controls */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {(["ALL", "PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as StatusFilter[]).map(
                                (s) => (
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
                                )
                            )}
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
                                                    Listing ID
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
                                            {applications.map((app) => (
                                                <tr
                                                    key={app.id}
                                                    className="border-t border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <span className="font-mono text-xs">
                                                            {app.listingId}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {app.status}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {formatDate(app.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {formatDate(
                                                            app.decidedAt || app.updatedAt
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 max-w-xs">
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
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                                        {app.status === "PENDING" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleWithdraw(app.id)
                                                                }
                                                                disabled={
                                                                    withdrawingId === app.id
                                                                }
                                                                className={`px-4 py-2 rounded-3xl border text-sm font-roboto-light ${
                                                                    withdrawingId === app.id
                                                                        ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                        : "border-red-500 text-red-600 bg-white hover:bg-red-50"
                                                                }`}
                                                            >
                                                                {withdrawingId === app.id
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
                                            ))}
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

