import React, { useEffect, useRef, useState } from "react";
import { useUser } from "./temp/UserContext";
import { X, Upload } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type CreateListingModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: (created: any) => void;
};

export default function CreateListingModal({
                                               open,
                                               onClose,
                                               onCreated,
                                           }: CreateListingModalProps) {
    const { username } = useUser();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<string>("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [moveInStart, setMoveInStart] = useState("");
    const [moveInEnd, setMoveInEnd] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const initialInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (open) {
            document.body.classList.add("overflow-hidden");
            setTimeout(() => initialInputRef.current?.focus(), 0);
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => document.body.classList.remove("overflow-hidden");
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newFiles = Array.from(files);
        setSelectedImages((prev) => [...prev, ...newFiles]);
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () =>
                setImagePreviews((prev) => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };
    const toISODateOrNull = (s: string) => {
        const t = s.trim();
        return t ? new Date(`${t}T00:00:00.000Z`).toISOString() : null;
    };

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                user: username.trim(),
                description: description.trim(),
                price: Math.round(Number(price || 0) * 100),
                location: location.trim(),
                moveInStart: toISODateOrNull(moveInStart),
                moveInEnd: toISODateOrNull(moveInEnd),
                status: "ACTIVE",
            };

            const res = await fetch(`${API_BASE}/listings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }

            const created = await res.json().catch(() => ({}));
            onCreated?.(created);

            setTitle("");
            setPrice("");
            setDescription("");
            setLocation("");
            setMoveInStart("");
            setMoveInEnd("");
            setSelectedImages([]);
            setImagePreviews([]);
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-lg ring-1 ring-black/5">
                    <div className="px-4 pt-4 flex justify-between items-center border-b pb-2">
                        <h2
                            id="create-listing-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Create a Listing
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3 text-sm">
                        <div className="space-y-1">
                            <label htmlFor="title" className="font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                ref={initialInputRef}
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={120}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                                placeholder="e.g., Cozy Apartment in West Lafayette"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label htmlFor="price" className="font-medium text-gray-700">
                                    Price (USD)
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                                    placeholder="1200.00"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="location" className="font-medium text-gray-700">
                                    Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                                    placeholder="West Lafayette, IN"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">
                                    Move-in Start
                                </label>
                                <input
                                    type="date"
                                    value={moveInStart}
                                    onChange={(e) => setMoveInStart(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Move-in End</label>
                                <input
                                    type="date"
                                    value={moveInEnd}
                                    onChange={(e) => setMoveInEnd(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="description"
                                className="font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black resize-none"
                                placeholder="Briefly describe your listing..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">Photos</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="images"
                                    className="cursor-pointer flex flex-col items-center gap-1"
                                >
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                    Click to upload images
                  </span>
                                </label>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview || "/placeholder.svg"}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && <div className="text-xs text-red-600">{error}</div>}

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-gray-300 px-3 py-1 text-sm cursor-pointer"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
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
