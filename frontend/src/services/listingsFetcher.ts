export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const fetcher = (path: string) =>
    fetch(`${API_URL}${path}`, {
        // add auth if needed:
        headers: localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : undefined,
        credentials: 'include', // remove if not using cookie auth
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });

