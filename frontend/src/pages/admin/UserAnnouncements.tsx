import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

const API_URL = "http://localhost:3000/announcements"; // same backend endpoint

export default function UserAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Handle both array and object responses
        const list = Array.isArray(data) ? data : data.announcements;
        setAnnouncements(list);
      } catch (err) {
        setError("Failed to load announcements.");
        console.error(err);
      }
    }
    fetchAnnouncements();
  }, []);

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">Latest Announcements</h2>

      {announcements.length === 0 ? (
        <p className="text-center text-gray-500">No announcements available.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{a.title}</h3>
              <p className="text-gray-700 mb-2">{a.message}</p>
              <p className="text-sm text-gray-400 text-right">
                Posted on {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
