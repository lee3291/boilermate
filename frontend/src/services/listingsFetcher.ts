export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const fetcher = (path: string, init?: RequestInit) =>
  fetch(`${API_URL}${path}`, {
    headers: {
      ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}),
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    ...init,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`);
    }

    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : null;
  });

