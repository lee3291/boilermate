import { useEffect, useMemo, useState, Fragment } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../../../contexts/AuthContext";
import useSWR from "swr";
import { fetcher } from "../../../../services/listingsFetcher";

type ListingStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type RoommateApplicationStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";

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

type Visibility = "PUBLIC" | "PRIVATE";
type PreferenceKind = "PROFILE" | "ROOMMATE";

type ApplicantPreferenceItem = {
    id: string;
    category: string;
    label: string;
    value: string;
    importance: number;
    visibility: Visibility;
    kind: PreferenceKind;
};

type ApplicantPreferences = {
    profile: ApplicantPreferenceItem[];
    roommate: ApplicantPreferenceItem[];
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

function importanceText(n: number) {
    if (n >= 5) return "5 – Deal-breaker";
    if (n === 4) return "4 – Very important";
    if (n === 3) return "3 – Neutral";
    if (n === 2) return "2 – Mild";
    if (n <= 1) return "1 – Low";
    return `${n}`;
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


    const [prefsByApplicant, setPrefsByApplicant] = useState<
        Record<string, ApplicantPreferences | undefined>
    >({});
    const [prefsLoadingByApplicant, setPrefsLoadingByApplicant] = useState<
        Record<string, boolean>
    >({});
    const [prefsErrorByApplicant, setPrefsErrorByApplicant] = useState<
        Record<string, string | null>
    >({});


    const [userIdByApplicant, setUserIdByApplicant] = useState<
        Record<string, string | null>
    >({});


    const [compareSelectionByListing, setCompareSelectionByListing] = useState<
        Record<string, string[]>
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

    const apiUsername = useMemo(() => {
        if (!me) return null;
        return me.username ?? me.emailLocal ?? me.id ?? null;
    }, [me]);

    const { data, error, isLoading } = useSWR(
        apiUsername
            ? `/listings/users/${encodeURIComponent(apiUsername)}/listings`
            : null,
        fetcher,
    );

    const mine = useMemo(() => (Array.isArray(data) ? data : []), [data]);


    /**
     * Resolve real User.id from applicantId (which is the name/email prefix).
     * Uses /profile/search-by-id?emailPrefix=<applicantId> and matches on emailLocalPart.
     */
    const resolveUserIdForApplicant = async (
        applicantId: string,
    ): Promise<string | null> => {
        const key = applicantId?.trim().toLowerCase();
        if (!key) return null;

        if (Object.prototype.hasOwnProperty.call(userIdByApplicant, key)) {
            return userIdByApplicant[key];
        }

        try {
            const url = apiUrl(
                `/profile/search-by-id?emailPrefix=${encodeURIComponent(applicantId)}`,
            );
            const res = await fetch(url);
            if (!res.ok) {
                console.error(
                    "[ManageRoommateApplications] search-by-id failed",
                    applicantId,
                    res.status,
                );
                setUserIdByApplicant((prev) => ({ ...prev, [key]: null }));
                return null;
            }

            const text = await res.text();
            const json = text ? JSON.parse(text) : null;

            let users: any[] = [];
            if (Array.isArray(json)) {
                users = json;
            } else if (Array.isArray(json?.users)) {
                users = json.users;
            } else if (Array.isArray(json?.results)) {
                users = json.results;
            } else if (json && typeof json === "object") {
                users = [json];
            }

            if (!users.length) {
                setUserIdByApplicant((prev) => ({ ...prev, [key]: null }));
                return null;
            }

            const targetPrefix = key;
            let matchedUser: any | null = null;

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
                    matchedUser = u;
                    break;
                }
            }

            if (!matchedUser) {
                matchedUser = users[0];
            }

            const userIdRaw =
                matchedUser?.id ??
                matchedUser?.userId ??
                matchedUser?.sub ??
                matchedUser?._id;

            const userId =
                typeof userIdRaw === "string"
                    ? userIdRaw
                    : userIdRaw != null
                    ? String(userIdRaw)
                    : null;

            setUserIdByApplicant((prev) => ({ ...prev, [key]: userId }));
            return userId;
        } catch (err) {
            console.error(
                "[ManageRoommateApplications] resolveUserIdForApplicant error",
                applicantId,
                err,
            );
            const key = applicantId?.trim().toLowerCase();
            if (key) {
                setUserIdByApplicant((prev) => ({ ...prev, [key]: null }));
            }
            return null;
        }
    };

    const mapPreferenceArray = (
        raw: any,
        kind: PreferenceKind,
    ): ApplicantPreferenceItem[] => {
        if (!raw) return [];

        const arr =
            Array.isArray(raw?.preferences)
                ? raw.preferences
                : Array.isArray(raw?.userProfilePreferences)
                ? raw.userProfilePreferences
                : Array.isArray(raw?.roommatePreferences)
                ? raw.roommatePreferences
                : Array.isArray(raw)
                ? raw
                : [];

        return arr
            .map((p: any): ApplicantPreferenceItem => {
                const prefObj = p.preference ?? {};
                const id = String(
                    p.preferenceId ??
                        prefObj.id ??
                        p.id ??
                        `${prefObj.category ?? ""}:${prefObj.value ?? ""}`,
                );
                const category = String(
                    p.category ?? prefObj.category ?? "Uncategorized",
                );
                const label = String(
                    prefObj.label ??
                        p.label ??
                        prefObj.value ??
                        p.value ??
                        "Unknown",
                );
                const value = String(
                    p.value ?? prefObj.value ?? p.preferenceId ?? id,
                );
                const importance =
                    typeof p.importance === "number" && Number.isFinite(p.importance)
                        ? p.importance
                        : 3;
                const visibilityRaw = String(
                    p.visibility ?? prefObj.visibility ?? "",
                ).toUpperCase();
                const visibility: Visibility =
                    visibilityRaw === "PRIVATE" ? "PRIVATE" : "PUBLIC";

                return {
                    id,
                    category,
                    label,
                    value,
                    importance,
                    visibility,
                    kind,
                };
            })
            .filter(
                (x: ApplicantPreferenceItem): boolean =>
                    !!x && typeof x.id === "string" && x.id.length > 0,
            );
    };

    /**
     * Load both personal (profile) and roommate preferences for a given applicant,
     * where applicantId is the email prefix (NOT the User.id).
     */
    const loadApplicantPreferencesForApplicant = async (
        applicantId: string,
    ): Promise<void> => {
        const key = applicantId?.trim().toLowerCase();
        if (!key) return;

        if (prefsByApplicant[key] && !prefsLoadingByApplicant[key]) return;
        if (prefsLoadingByApplicant[key]) return;

        setPrefsLoadingByApplicant((prev) => ({ ...prev, [key]: true }));
        setPrefsErrorByApplicant((prev) => ({ ...prev, [key]: null }));

        try {
            const userId = await resolveUserIdForApplicant(applicantId);
            if (!userId) {
                setPrefsErrorByApplicant((prev) => ({
                    ...prev,
                    [key]:
                        "Could not find a user account for this applicant (email prefix).",
                }));
                setPrefsLoadingByApplicant((prev) => ({ ...prev, [key]: false }));
                return;
            }

            const profileUrl = apiUrl(
                `/preferences/profile/${encodeURIComponent(userId)}`,
            );
            const roommateUrl = apiUrl(
                `/preferences/roommate/${encodeURIComponent(userId)}`,
            );

            const [profileRes, roommateRes] = await Promise.all([
                fetch(profileUrl),
                fetch(roommateUrl),
            ]);

            let profileJson: any = null;
            let roommateJson: any = null;

            if (profileRes.ok) {
                const text = await profileRes.text();
                profileJson = text ? JSON.parse(text) : null;
            }
            if (roommateRes.ok) {
                const text = await roommateRes.text();
                roommateJson = text ? JSON.parse(text) : null;
            }

            const profile = mapPreferenceArray(profileJson, "PROFILE");
            const roommate = mapPreferenceArray(roommateJson, "ROOMMATE");

            setPrefsByApplicant((prev) => ({
                ...prev,
                [key]: {
                    profile,
                    roommate,
                },
            }));
        } catch (err: any) {
            console.error(
                "[ManageRoommateApplications] loadApplicantPreferencesForApplicant error",
                applicantId,
                err,
            );
            setPrefsErrorByApplicant((prev) => ({
                ...prev,
                [key]:
                    err?.message ||
                    "Could not load preferences for this applicant.",
            }));
        } finally {
            setPrefsLoadingByApplicant((prev) => ({ ...prev, [key]: false }));
        }
    };


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

    const toggleExpanded = (applicationId: string, applicantId: string) => {
        setExpandedAppIds((prev) =>
            prev.includes(applicationId)
                ? prev.filter((id) => id !== applicationId)
                : [...prev, applicationId],
        );

        const key = applicantId?.trim().toLowerCase();
        if (
            key &&
            !prefsByApplicant[key] &&
            !prefsLoadingByApplicant[key]
        ) {
            void loadApplicantPreferencesForApplicant(applicantId);
        }
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
                }
                throw new Error(msg);
            }

            const updated: RoommateApplication = raw ? JSON.parse(raw) : null;

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

    const renderGroupedPreferences = (items: ApplicantPreferenceItem[]) => {
        const visible = items.filter((p) => p.visibility === "PUBLIC");
        if (!visible.length) {
            return (
                <p className="text-sm text-gray-500 font-roboto-light">
                    No visible preferences for this section.
                </p>
            );
        }

        const byCategory: Record<string, ApplicantPreferenceItem[]> = {};
        for (const p of visible) {
            if (!byCategory[p.category]) byCategory[p.category] = [];
            byCategory[p.category].push(p);
        }

        const categories = Object.entries(byCategory).sort(([a], [b]) =>
            a.localeCompare(b),
        );

        return (
            <div className="space-y-4">
                {categories.map(([category, prefs]) => (
                    <div key={category}>
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-roboto-medium mb-1">
                            {category}
                        </div>
                        <div className="space-y-1">
                            {prefs
                                .slice()
                                .sort((a, b) =>
                                    a.label.localeCompare(b.label),
                                )
                                .map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="text-gray-800 font-roboto-light">
                                            {p.label}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-roboto-light">
                                                {importanceText(p.importance)}
                                            </span>
                                            <div className="flex gap-[2px]">
                                                {Array.from({ length: 5 }).map(
                                                    (_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={
                                                                idx < p.importance
                                                                    ? "h-1.5 w-2 rounded-full bg-black"
                                                                    : "h-1.5 w-2 rounded-full bg-gray-200"
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderApplicantPreferences = (app: RoommateApplication) => {
        const key = app.applicantId?.trim().toLowerCase();
        const prefs = key ? prefsByApplicant[key] : undefined;
        const loading = key ? prefsLoadingByApplicant[key] : false;
        const error = key ? prefsErrorByApplicant[key] : null;

        if (loading) {
            return (
                <p className="text-sm text-gray-600 font-roboto-light">
                    Loading preferences…
                </p>
            );
        }

        if (error) {
            return (
                <div className="space-y-2">
                    <p className="text-sm text-red-600 font-roboto-light">
                        {error}
                    </p>
                    {app.preferenceSnapshot && (
                        <>
                            <p className="text-xs text-gray-500 font-roboto-light">
                                Showing fallback snapshot from application:
                            </p>
                            {renderPreferenceSnapshot(app.preferenceSnapshot)}
                        </>
                    )}
                </div>
            );
        }

        if (!prefs || (!prefs.profile.length && !prefs.roommate.length)) {
            if (app.preferenceSnapshot) {
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-roboto-light">
                            No structured preferences on file. Showing snapshot saved
                            at application time:
                        </p>
                        {renderPreferenceSnapshot(app.preferenceSnapshot)}
                    </div>
                );
            }
            return (
                <p className="text-sm text-gray-500 font-roboto-light">
                    No preferences available for this applicant.
                </p>
            );
        }

        return (
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-roboto-medium text-gray-700 mb-1">
                        About this applicant (I am…)
                    </h4>
                    {renderGroupedPreferences(prefs.profile)}
                </div>
                <div>
                    <h4 className="text-sm font-roboto-medium text-gray-700 mb-1">
                        What they&apos;re looking for (I want…)
                    </h4>
                    {renderGroupedPreferences(prefs.roommate)}
                </div>
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

    const toggleCompareSelection = (listingId: string, applicantId: string) => {
        const key = applicantId?.trim().toLowerCase();
        if (!key) return;

        setCompareSelectionByListing((prev) => {
            const current = prev[listingId] ?? [];
            const exists = current.includes(key);
            let next: string[];
            if (exists) {
                next = current.filter((id) => id !== key);
            } else {
                next = [...current, key].slice(0, 5);
                if (!prefsByApplicant[key] && !prefsLoadingByApplicant[key]) {
                    void loadApplicantPreferencesForApplicant(applicantId);
                }
            }
            return { ...prev, [listingId]: next };
        });
    };

    const renderComparisonForListing = (listing: ListingWithApplications) => {
        const selectedKeys = compareSelectionByListing[listing.listingId] ?? [];
        if (selectedKeys.length < 2) return null;

        const selectedApps = listing.applications.filter((app) =>
            selectedKeys.includes(app.applicantId?.trim().toLowerCase()),
        );
        if (selectedApps.length < 2) return null;

        const headerLabelForApp = (app: RoommateApplication) =>
            app.applicantId || "Unknown";

        const buildRows = (kind: PreferenceKind) => {
            const rowMap = new Map<
                string,
                { category: string; label: string; value: string }
            >();

            for (const app of selectedApps) {
                const key = app.applicantId?.trim().toLowerCase();
                if (!key) continue;
                const prefs = prefsByApplicant[key];
                const list =
                    kind === "PROFILE"
                        ? prefs?.profile ?? []
                        : prefs?.roommate ?? [];
                for (const p of list || []) {
                    if (p.visibility === "PRIVATE") continue;
                    const k = `${p.category}::${p.value}`;
                    if (!rowMap.has(k)) {
                        rowMap.set(k, {
                            category: p.category,
                            label: p.label,
                            value: p.value,
                        });
                    }
                }
            }

            return Array.from(rowMap.entries())
                .map(([k, meta]) => ({ key: k, ...meta }))
                .sort((a, b) => {
                    const cat = a.category.localeCompare(b.category);
                    if (cat !== 0) return cat;
                    return a.label.localeCompare(b.label);
                });
        };

        const profileRows = buildRows("PROFILE");
        const roommateRows = buildRows("ROOMMATE");

        const renderSection = (
            title: string,
            kind: PreferenceKind,
            rows: { key: string; category: string; label: string }[],
        ) => {
            if (!rows.length) {
                return (
                    <p className="text-sm text-gray-500 font-roboto-light">
                        No shared preferences in this section for the selected
                        applicants.
                    </p>
                );
            }

            return (
                <div className="mt-4">
                    <h4 className="text-sm font-roboto-medium text-gray-800 mb-2">
                        {title}
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-xs font-roboto-medium text-gray-700">
                                        Preference
                                    </th>
                                    {selectedApps.map((app) => (
                                        <th
                                            key={app.id}
                                            className="px-4 py-2 text-xs font-roboto-medium text-gray-700"
                                        >
                                            {headerLabelForApp(app)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {rows.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-t border-gray-100 last:border-b"
                                    >
                                        <td className="px-4 py-2 align-top text-sm">
                                            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-roboto-medium">
                                                {row.category}
                                            </div>
                                            <div className="text-gray-800 font-roboto-light">
                                                {row.label}
                                            </div>
                                        </td>
                                        {selectedApps.map((app) => {
                                            const key =
                                                app.applicantId?.trim().toLowerCase();
                                            const prefs = key
                                                ? prefsByApplicant[key]
                                                : undefined;
                                            const list =
                                                kind === "PROFILE"
                                                    ? prefs?.profile ?? []
                                                    : prefs?.roommate ?? [];
                                            const match = list.find(
                                                (p) =>
                                                    p.visibility === "PUBLIC" &&
                                                    p.category === row.category &&
                                                    p.label === row.label,
                                            );
                                            if (!match) {
                                                return (
                                                    <td
                                                        key={app.id}
                                                        className="px-4 py-2 align-top text-sm text-gray-400 font-roboto-light"
                                                    >
                                                        —
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td
                                                    key={app.id}
                                                    className="px-4 py-2 align-top text-sm text-gray-800 font-roboto-light"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-600">
                                                            {importanceText(
                                                                match.importance,
                                                            )}
                                                        </span>
                                                        <div className="flex gap-[2px]">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={
                                                                        idx <
                                                                        match.importance
                                                                            ? "h-1.5 w-2 rounded-full bg-black"
                                                                            : "h-1.5 w-2 rounded-full bg-gray-200"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        return (
            <div className="mt-4 mb-4 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-4">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-roboto-medium text-gray-800">
                        Compare selected applicants
                    </h3>
                    <p className="text-xs text-gray-500 font-roboto-light">
                        Selected: {selectedApps.length} · Showing PUBLIC preferences
                        only.
                    </p>
                </div>
                {renderSection("About them (I am…)", "PROFILE", profileRows)}
                {renderSection(
                    "What they want in a roommate (I want…)",
                    "ROOMMATE",
                    roommateRows,
                )}
            </div>
        );
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
                            applicationsByListing.map((listing) => {
                                const selectedKeys =
                                    compareSelectionByListing[listing.listingId] ?? [];

                                return (
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
                                                    {listing.location ||
                                                        "Unknown location"}{" "}
                                                    · Looking for{" "}
                                                    {listing.roommates || "?"} roommate(s)
                                                    {listing.moveInStart
                                                        ? ` · Move-in: ${
                                                              listing.moveInStart
                                                          }${
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
                                                            Compare
                                                        </th>
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
                                                        const isExpanded =
                                                            expandedAppIds.includes(app.id);
                                                        const isSaving =
                                                            !!savingStatusById[app.id];
                                                        const canDecide =
                                                            app.status === "PENDING";
                                                        const key =
                                                            app.applicantId
                                                                ?.trim()
                                                                .toLowerCase() || "";
                                                        const compareSelected =
                                                            selectedKeys.includes(key);

                                                        return (
                                                            <Fragment key={app.id}>
                                                                <tr className="border-t border-gray-100 hover:bg-gray-50">
                                                                    <td className="px-4 py-2 align-top">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                                            checked={compareSelected}
                                                                            onChange={() =>
                                                                                toggleCompareSelection(
                                                                                    listing.listingId,
                                                                                    app.applicantId,
                                                                                )
                                                                            }
                                                                            aria-label="Include in comparison"
                                                                        />
                                                                    </td>
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
                                                                                    toggleExpanded(
                                                                                        app.id,
                                                                                        app.applicantId,
                                                                                    )
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
                                                                            colSpan={7}
                                                                            className="px-6 py-4"
                                                                        >
                                                                            <h3 className="text-sm font-roboto-medium text-gray-700 mb-2">
                                                                                Applicant preferences
                                                                            </h3>
                                                                            {renderApplicantPreferences(
                                                                                app,
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

                                        {renderComparisonForListing(listing)}
                                    </div>
                                );
                            })}

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

