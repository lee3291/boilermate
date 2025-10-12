import { useState } from 'react';
import { createListing } from '../../services/listings';

export default function CreateListingForm() {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrMsg(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        try {
            const result = await createListing({
                title: String(fd.get('title') || ''),
                description: String(fd.get('description') || ''),
                price: Number(fd.get('price') || 0), // cents
                location: String(fd.get('location') || ''),
                mediaUrls: String(fd.get('mediaUrls') || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                status: 'ACTIVE',
                // creatorId: 'user_123', // TEMP ONLY if backend lacks auth injection
            });
            console.log('Created listing:', result.listing);
            // navigate or show success...
        } catch (e: any) {
            setErrMsg(e?.message ?? 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <input name="title" placeholder="Title" />
            <textarea name="description" placeholder="Description" />
            <input name="price" type="number" placeholder="Price (cents)" />
            <input name="location" placeholder="Location" />
            <input name="mediaUrls" placeholder="Comma-separated URLs" />
            <button disabled={loading} type="submit">{loading ? 'Saving…' : 'Create'}</button>
            {errMsg && <p style={{ color: 'red' }}>{errMsg}</p>}
        </form>
    );
}

