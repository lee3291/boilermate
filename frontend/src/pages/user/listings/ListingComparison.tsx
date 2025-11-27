import { useEffect, useMemo } from "react";

export type ListingForCompare = {
    id: string;
    title: string;
    user: string;
    description?: string;
    price: number;
    location: string;
    moveInStart: string | null;
    moveInEnd: string | null;
};

type ListingComparisonProps = {
    listings: ListingForCompare[];
    onClose: () => void;
};

export default function ListingComparison({ listings, onClose }: ListingComparisonProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const formatter = useMemo(
        () =>
            Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
            }),
        []
    );

    const rows = [
        { label: "Title", render: (l: ListingForCompare) => l.title || "—" },
        { label: "Price", render: (l: ListingForCompare) => formatter.format((l.price ?? 0) / 100) },
        { label: "Location", render: (l: ListingForCompare) => l.location || "—" },
        {
            label: "Move-in Window",
            render: (l: ListingForCompare) => `${l.moveInStart ?? "—"} → ${l.moveInEnd ?? "—"}`,
        },
        { label: "Posted By", render: (l: ListingForCompare) => l.user || "—" },
        {
            label: "Description",
            render: (l: ListingForCompare) => (l.description?.trim() ? l.description : "—"),
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
                />

            {/* Modal */}
            <div className="relative z-10 mx-4 w-[min(1200px,95vw)] max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-maingray font-sourceserif4-18pt-regular text-[40px]">Listing Comparison</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close comparison"
                        className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {listings.length === 0 ? (
                    <div className="p-6 text-gray-600">No listings selected.</div>
                ) : (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                {/* Grid: first column = labels, then one column per listing */}
                                <div
                                    className="grid gap-0"
                                    style={{
                                        gridTemplateColumns: `220px repeat(${listings.length}, minmax(220px, 1fr))`,
                                    }}
                                >
                                    {/* Header row */}
                                    <div className="sticky left-0 z-10 bg-white p-3 font-roboto-semibold text-gray-700 border-b border-r">
                                        Criteria
                                    </div>
                                    {listings.map((l) => (
                                        <div
                                            key={`head-${l.id}`}
                                            className="p-3 font-roboto-semibold text-gray-900 border-b"
                                            title={l.title}
                                        >
                                            {l.title}
                                        </div>
                                    ))}

                                    {/* Data rows */}
                                    {rows.map((row) => (
                                        <Row key={row.label} label={row.label}>
                                            {listings.map((l) => (
                                                <Cell key={`${row.label}-${l.id}`}>{row.render(l)}</Cell>
                                            ))}
                                        </Row>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-black hover:text-white transition cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="sticky left-0 z-10 bg-white p-3 text-sm text-gray-600 border-b border-r">
                {label}
            </div>
            {children}
        </>
    );
}

function Cell({ children }: { children: React.ReactNode }) {
    return <div className="p-3 text-sm text-gray-800 border-b">{children}</div>;
}

