import React, { useEffect, useRef, useState } from "react";

type CreateListingModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: (created: any) => void; // optional hook to refresh parent data
};

export default function CreateListingModal({ open, onClose, onCreated }: CreateListingModalProps) {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<string>("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialInputRef = useRef<HTMLInputElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    // Lock body scroll and focus first input when open
    useEffect(() => {
        if (open) {
            document.body.classList.add("overflow-hidden");
            setTimeout(() => initialInputRef.current?.focus(), 0);
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => document.body.classList.remove("overflow-hidden");
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                // store cents as integer if your API expects that
                price: Math.round(Number(price || 0) * 100),
            };

            // Adjust the endpoint to match your API
            const res = await fetch("/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `Request failed with ${res.status}`);
            }

            const created = await res.json().catch(() => ({}));
            onCreated?.(created);

            // clear form & close
            setTitle("");
            setPrice("");
            setDescription("");
            onClose();
        } catch (err: any) {
            setError(err?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-listing-title"
            onMouseDown={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

            {/* Modal */}
            <div
                ref={dialogRef}
                className="absolute inset-0 flex items-center justify-center p-4"
            >
                <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                    <div className="px-6 pt-6">
                        <h2 id="create-listing-title" className="text-2xl font-semibold text-gray-900">
                            Create a Listing
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Fill in the details below and hit submit.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                            <input
                                ref={initialInputRef}
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="e.g., Handmade Mug"
                                />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="price" className="text-sm font-medium text-gray-700">Price (USD)</label>
                            <input
                                id="price"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="19.99"
                                />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="Tell buyers more about your listing..."
                                />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-gray-300 px-4 py-2 text-sm cursor-pointer"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting…" : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

