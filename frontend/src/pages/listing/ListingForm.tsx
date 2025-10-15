import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { createListing } from "../../services/listingService";

interface ListingFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ListingForm({ isOpen, onClose }: ListingFormProps) {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [rent, setRent] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    if (!isOpen) return null;

    // Rent price can only be > 0
    const handleNumber = (e: React.ChangeEvent<HTMLInputElement>,
                          setter: React.Dispatch<React.SetStateAction<string>>) => {
        let value = e.target.value;
        // Remove all characters except digits and dot
        value = value.replace(/[^0-9.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) {
            value = parts[0] + "." + parts[1]; // keep only first dot
        }
        setter(value);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) {
            return;
        }
        const newFiles = Array.from(files);
        setSelectedImages(prev => [...prev, ...newFiles]);

        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createListing({
                userID: "user123",
                title,
                description,
                pricing: Number(rent),
                location,
                media: [],
            });
            alert("You have just created a listing successfully!");
            //Reset
            setTitle("");
            setLocation("");
            setRent("");
            setDescription("");
            setSelectedImages([]);
            setImagePreviews([]);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }

    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl m-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Make a listing</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Find roommate ASAP!!!"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="123 Main St, City, State"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Rent*/}
                    <div className="space-y-2">
                        <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
                            Monthly Rent
                        </label>
                        <input
                            type="text" // use text to fully control allowed chars
                            id="rent"
                            value={rent}
                            onChange={e => handleNumber(e, setRent)}
                            placeholder="0.00"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />

                    </div>

                    {/* Photos */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Photos</label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-sm text-gray-600">Click to upload images</span>
                                <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                            </label>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview || "/placeholder.svg"}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tell your potential roommates about the place..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
