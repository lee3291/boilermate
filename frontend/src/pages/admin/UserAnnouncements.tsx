import React, { useEffect, useState } from 'react';

type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isActive: boolean;
  scheduledAt?: string | null;
  likes: number;
};

const API_URL = 'http://localhost:3000/announcements';

export default function UserAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [sortByLikes, setSortByLikes] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAnnouncements();
    const stored = localStorage.getItem('likedAnnouncements');
    if (stored) setLiked(JSON.parse(stored));
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const now = Date.now();

      const filtered = (Array.isArray(data) ? data : data.announcements ?? data).filter(
        (a: Announcement) => {
          if (!a.isActive) return false;
          if (a.scheduledAt) {
            const t = Date.parse(a.scheduledAt);
            return isNaN(t) || t <= now;
          }
          return true;
        }
      );

      setAnnouncements(filtered);
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
  }

  async function likeAnnouncement(id: string) {
    if (liked.includes(id)) return;

    // Optimistic UI update
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a)
    );
    const updated = [...liked, id];
    setLiked(updated);
    localStorage.setItem('likedAnnouncements', JSON.stringify(updated));

    try {
      await fetch(`${API_URL}/${id}/like`, { method: 'POST' });
    } catch (e) {
      console.error('Like failed', e);
    }
  }

  const filtered = announcements.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      a.message.toLowerCase().includes(term)
    );
  });

  const sorted = [...filtered].sort((a, b) =>
    sortByLikes
      ? b.likes - a.likes
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title or msg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => setSortByLikes(prev => !prev)}
            className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            Sort by: {sortByLikes ? 'Most Liked' : 'Newest'}
          </button>
        </div>
      </div>

      {sorted.map(a => (
        <div key={a.id} className="bg-white border rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-lg font-semibold mb-1">{a.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{a.message}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{new Date(a.createdAt).toLocaleString()}</span>
            <button
              onClick={() => likeAnnouncement(a.id)}
              disabled={liked.includes(a.id)}
              className={`text-blue-600 hover:underline disabled:text-gray-400`}
            >
              Like {a.likes} {liked.includes(a.id) ? '(Liked)' : ''}
            </button>
          </div>
        </div>
      ))}

      {sorted.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No announcements to display.</p>
      )}
    </div>
  );
}
