'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ---------- ENV ----------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Types aligned to your backend ----------
type ListingStatus = 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';

type CreateListingBody = {
  title: string;
  description: string;
  price: number; // integer cents
  location: string;
  mediaUrls: string[];
  status?: ListingStatus;
};

// ---------- Helpers ----------
const STATUS_OPTIONS: ListingStatus[] = ['ACTIVE', 'ARCHIVED', 'RESOLVED'];

function parsePriceToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

function parseMediaUrls(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function validate(body: Partial<CreateListingBody>) {
  const errors: Record<string, string> = {};

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.title = 'title is required';
  } else if (body.title.trim().length > 120) {
    errors.title = 'title must be ≤ 120 chars';
  }

  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    errors.description = 'description is required';
  } else if (body.description.trim().length > 10_000) {
    errors.description = 'description must be ≤ 10000 chars';
  }

  if (typeof body.price !== 'number' || !Number.isInteger(body.price) || body.price < 0) {
    errors.price = 'price must be an integer ≥ 0 (in cents)';
  }

  if (typeof body.location !== 'string' || body.location.trim().length === 0) {
    errors.location = 'location is required';
  } else if (body.location.trim().length > 140) {
    errors.location = 'location must be ≤ 140 chars';
  }

  if (!Array.isArray(body.mediaUrls)) {
    errors.mediaUrls = 'mediaUrls must be an array of URL strings';
  } else if (body.mediaUrls.length > 20) {
    errors.mediaUrls = 'mediaUrls max length is 20';
  }

  if (body.status && !STATUS_OPTIONS.includes(body.status)) {
    errors.status = `status must be one of ${STATUS_OPTIONS.join(', ')}`;
  }

  return errors;
}

// ---------- Page ----------
export default function NewListingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [location, setLocation] = useState('');
  const [mediaCsv, setMediaCsv] = useState('');
  const [status, setStatus] = useState<ListingStatus | ''>('');

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<any>(null);
  const [successPayload, setSuccessPayload] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const previewBody = useMemo(() => {
    const cents = parsePriceToCents(priceInput);
    const body: Partial<CreateListingBody> = {
      title: title.trim(),
      description: description.trim(),
      price: cents ?? undefined,
      location: location.trim(),
      mediaUrls: parseMediaUrls(mediaCsv),
      status: (status || undefined) as ListingStatus | undefined,
    };
    return body;
  }, [title, description, priceInput, location, mediaCsv, status]);

  useEffect(() => {
    // Optional defaults for quick test
    if (!title && !description) {
      setTitle('Cozy Loft');
      setDescription('Bright loft with plants and a big desk.');
      setPriceInput('120.00');
      setLocation('Indianapolis, IN');
      setMediaCsv('https://pics.example/a.jpg, https://pics.example/b.jpg');
      setStatus('ACTIVE');
    }
    // Show current user (if signed in)
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccessPayload(null);

    const errors = validate(previewBody);
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) throw error;
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('No Supabase session. Please sign in first.');

      const body: CreateListingBody = {
        title: previewBody.title!,
        description: previewBody.description!,
        price: previewBody.price!, // cents
        location: previewBody.location!,
        mediaUrls: previewBody.mediaUrls || [],
        ...(previewBody.status ? { status: previewBody.status } : {}),
      };

      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw payload || { message: `HTTP ${res.status}` };
      setSuccessPayload(payload);
    } catch (err: any) {
      setServerError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Listing</h1>
      <p className="mt-1 text-sm text-zinc-600">
        This calls <code className="font-mono">POST /listings</code>. Ensure you&apos;re signed in
        so the backend can read <code className="font-mono">req.user.id</code>.
      </p>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
        <div>
          Auth status:&nbsp;
          {userId ? (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800">
              signed in (user {userId})
            </span>
          ) : (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">not signed in</span>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="≤ 120 chars"
          />
          {clientErrors.title && <p className="mt-1 text-sm text-red-600">{clientErrors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            rows={5}
            maxLength={10_000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="≤ 10,000 chars"
          />
          {clientErrors.description && (
            <p className="mt-1 text-sm text-red-600">{clientErrors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Price (USD)</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            inputMode="decimal"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="e.g. 120.00"
          />
          <p className="mt-1 text-xs text-zinc-600">
            Will be sent as <span className="font-mono">{String(previewBody.price ?? '—')}</span> cents
          </p>
          {clientErrors.price && <p className="mt-1 text-sm text-red-600">{clientErrors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            maxLength={140}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State"
          />
          {clientErrors.location && (
            <p className="mt-1 text-sm text-red-600">{clientErrors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Media URLs (comma-separated)</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            value={mediaCsv}
            onChange={(e) => setMediaCsv(e.target.value)}
            placeholder="https://... , https://..."
          />
          <p className="mt-1 text-xs text-zinc-600">
            {(previewBody.mediaUrls || []).length} URLs (max 20)
          </p>
          {clientErrors.mediaUrls && (
            <p className="mt-1 text-sm text-red-600">{clientErrors.mediaUrls}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Status (optional)</label>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-900"
            value={status}
            onChange={(e) => setStatus((e.target.value || '') as any)}
          >
            <option value="">(default ACTIVE)</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {clientErrors.status && (
            <p className="mt-1 text-sm text-red-600">{clientErrors.status}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Create Listing'}
        </button>
      </form>

      {/* Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Request Preview</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
{JSON.stringify(previewBody, null, 2)}
        </pre>
      </div>

      {/* Success */}
      {successPayload && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <h3 className="font-medium text-emerald-900">Success</h3>
          <pre className="mt-2 overflow-x-auto text-sm">
{JSON.stringify(successPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {serverError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3">
          <h3 className="font-medium text-red-900">Server Error</h3>
          <pre className="mt-2 overflow-x-auto text-sm">
{JSON.stringify(serverError, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-red-800">
            If you see <code>creatorId missing from auth context</code>, ensure your Nest auth guard
            decodes the Supabase JWT and sets <code>req.user.id</code>.
          </p>
        </div>
      )}
    </div>
  );
}

