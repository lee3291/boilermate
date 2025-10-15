import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
type ListingStatus = 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';

type CreateListingBody = {
  title: string;
  description: string;
  price: number; // cents
  location: string;
  mediaUrls: string[];
  status?: ListingStatus;
};

type CreateListingResult = {
  listing: {
    id: string;
    creatorId: string;
    title: string;
    description: string;
    price: number;
    location: string;
    mediaUrls: string[];
    status: ListingStatus;
    viewCount: number;
    createdAt: string; // ISO
    updatedAt: string; // ISO
  };
};

type ValidationErrors = Partial<Record<keyof CreateListingBody, string>> & {
  message?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function ListingsCreateTest() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>(''); // as text, convert -> int
  const [location, setLocation] = useState('');
  const [mediaUrlsText, setMediaUrlsText] = useState(''); // comma/line separated
  const [status, setStatus] = useState<ListingStatus | ''>('');

  const [authMode, setAuthMode] = useState<'bearer' | 'cookie'>('bearer');
  const [token, setToken] = useState(''); // JWT when bearer mode

  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<CreateListingResult | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const mediaUrls = useMemo(() => {
    return mediaUrlsText
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [mediaUrlsText]);

  function parsePriceToIntCents(v: string): number | null {
    // Accepts either integer cents or dollar-like text
    // "1999" -> 1999, "19.99" -> 1999
    const trimmed = v.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    const dollars = Number(trimmed);
    if (!Number.isFinite(dollars)) return null;
    return Math.round(dollars * 100);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerErrors({});
    setGenericError(null);
    setResult(null);

    const cents = parsePriceToIntCents(price);
    if (cents === null || cents < 0) {
      setSubmitting(false);
      setServerErrors({ price: 'Enter a valid non-negative amount (e.g., 1999 or 19.99)' });
      return;
    }

    const body: CreateListingBody = {
      title: title.trim(),
      description: description.trim(),
      price: cents,
      location: location.trim(),
      mediaUrls,
      ...(status ? { status } : {}),
    };

    try {
      const res = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authMode === 'bearer' && token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        credentials: authMode === 'cookie' ? 'include' : 'omit',
      });

      if (!res.ok) {
        // Try to read your controller's BadRequestException shape
        const maybeJson = await res.json().catch(() => null);
        if (maybeJson?.errors || maybeJson?.message) {
          setServerErrors({ ...maybeJson.errors, message: maybeJson.message });
        } else {
          setGenericError(`HTTP ${res.status} ${res.statusText}`);
        }
        return;
      }

      const data = (await res.json()) as CreateListingResult;
      setResult(data);
      // Clear the form a bit but leave auth inputs
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setMediaUrlsText('');
      setStatus('');
    } catch (err: any) {
      setGenericError(err?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Create Listing — Frontend Smoke Test</h1>
          <p className="text-sm text-gray-500">
            POST to <code className="font-mono">{API_URL}/listings</code>
          </p>
        </header>

        {/* Auth panel */}
        <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-950/5">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Auth Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAuthMode('bearer')}
                className={`rounded-xl px-3 py-1 text-sm ${authMode === 'bearer' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
              >
                Bearer (JWT)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('cookie')}
                className={`rounded-xl px-3 py-1 text-sm ${authMode === 'cookie' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
              >
                Cookie (credentials)
              </button>
            </div>
          </div>

          {authMode === 'bearer' && (
            <div className="mt-3">
              <label className="block text-sm font-medium">JWT (optional if your dev server injects req.user)</label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Sent as <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>
              </p>
            </div>
          )}

          {authMode === 'cookie' && (
            <p className="mt-2 text-xs text-gray-500">
              Requests use <code className="font-mono">credentials: 'include'</code>. Ensure your Nest CORS allows cookies and your domain matches.
            </p>
          )}
        </section>


        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-950/5 space-y-4"
        >
          {serverErrors.message && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {serverErrors.message}
            </div>
          )}
          {genericError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {genericError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              maxLength={120}
              required
            />
            {serverErrors.title && <p className="mt-1 text-xs text-red-600">{serverErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              rows={4}
              maxLength={10000}
              required
            />
            {serverErrors.description && <p className="mt-1 text-xs text-red-600">{serverErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Price (cents or dollars)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1999 or 19.99"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                inputMode="decimal"
                required
              />
              {serverErrors.price && <p className="mt-1 text-xs text-red-600">{serverErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                maxLength={140}
                required
              />
              {serverErrors.location && <p className="mt-1 text-xs text-red-600">{serverErrors.location}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Media URLs (comma or new line separated)</label>
            <textarea
              value={mediaUrlsText}
              onChange={(e) => setMediaUrlsText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="https://... , https://..."
            />
            {serverErrors.mediaUrls && <p className="mt-1 text-xs text-red-600">{serverErrors.mediaUrls}</p>}
            <p className="mt-1 text-xs text-gray-500">Parsed: {mediaUrls.length} url(s)</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Status (optional)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus | '')}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">(default ACTIVE)</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
            {serverErrors.status && <p className="mt-1 text-xs text-red-600">{serverErrors.status}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Create listing'}
            </button>
            <span className="text-xs text-gray-500">Sends JSON to <code>/listings</code></span>
          </div>
        </form>

        {/* Success display */}
        {result && (
          <section className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-950/5">
            <h2 className="text-lg font-semibold">Created</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <div><span className="font-medium">ID:</span> {result.listing.id}</div>
              <div><span className="font-medium">Creator:</span> {result.listing.creatorId}</div>
              <div><span className="font-medium">Title:</span> {result.listing.title}</div>
              <div><span className="font-medium">Price (cents):</span> {result.listing.price}</div>
              <div><span className="font-medium">Location:</span> {result.listing.location}</div>
              <div><span className="font-medium">Status:</span> {result.listing.status}</div>
              <div><span className="font-medium">Created:</span> {new Date(result.listing.createdAt).toLocaleString()}</div>
              <div className="mt-2">
                <span className="font-medium">Media URLs:</span>
                <ul className="ml-4 list-disc">
                  {result.listing.mediaUrls.map((u) => (
                    <li key={u}><a className="underline" href={u} target="_blank" rel="noreferrer">{u}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

