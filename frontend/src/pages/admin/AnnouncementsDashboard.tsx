// Admin Announcement Dashboard with Like Count Only (no like button)
// Includes: Create, Update, Delete, Schedule
// At the top of your file
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import React, { useEffect, useMemo, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  isScheduled?: boolean | null;
  scheduledAt?: string | null;
  likes?: number;
};

const API_URL = "http://localhost:3000/announcements";

export default function AnnouncementsDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>("");

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : data.announcements ?? data);
      } catch (err) {
        console.error(err);
        setStatusMsg("Could not connect to server.");
      }
    }
    fetchAnnouncements();
  }, []);

  

  const upcoming = useMemo(() => {
    const now = Date.now();
    return announcements.filter((a) => {
      if (a.isScheduled) return true;
      if (a.scheduledAt) {
        const t = Date.parse(a.scheduledAt);
        return Number.isFinite(t) && t > now;
      }
      return false;
    });
  }, [announcements]);

  const upcomingIds = useMemo(() => {
    return new Set(upcoming.map((a) => a.id));
  }, [upcoming]);

  function cleanText(s: string) {
    return s.replace(/\s+/g, " ").trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg("Please fill in both title and message.");
      return;
    }
    if (scheduleLater) {
      if (!scheduledAt || Date.parse(scheduledAt) <= Date.now()) {
        setStatusMsg("Scheduled time must be in the future.");
        return;
      }
    }
    const payload: Partial<Announcement> = {
      title: cleanText(title),
      message: cleanText(message),
      isScheduled: scheduleLater || undefined,
      scheduledAt: scheduleLater ? new Date(scheduledAt).toISOString() : undefined,
    };

    let res: Response;
    try {
      if (editing) {
        res = await fetch(`${API_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const newData = {
        ...data,
        likes: data.likes ?? 0,
      };

     if (editing) {
        setAnnouncements((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...newData } : a)));
        setStatusMsg(scheduleLater ? "Scheduled successfully." : "Announcement updated.");
      } else {
        setAnnouncements((prev) => [newData, ...prev]);
        setStatusMsg(scheduleLater ? "Scheduled successfully." : "Announcement posted.");
      }


      setTitle("");
      setMessage("");
      setEditing(null);
      setScheduleLater(false);
      setScheduledAt("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to submit announcement.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setStatusMsg("Announcement deleted.");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to delete announcement.");
    }
  }

  async function handleSendTop5Email() {
    setStatusMsg("Sending top 5 announcements...");

    try {
      const res = await fetch(`${API_URL}/email/top-liked`, { method: "POST" });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send email.");
      }

      setStatusMsg("✅ Top 5 announcements successfully emailed to all users.");
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`❌ Email send failed: ${err.message || "Unknown error"}`);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Announcements</h2>
      {statusMsg && <p className="text-blue-700 mb-3">{statusMsg}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow p-4 mb-6 rounded">
        <h3 className="font-semibold text-lg mb-3">{editing ? "Edit" : "New"} Announcement</h3>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border p-2 mb-2 w-full rounded" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="border p-2 mb-2 w-full rounded" rows={4} />

        <label className="block text-sm font-medium mb-1">
          <input type="checkbox" checked={scheduleLater} onChange={(e) => setScheduleLater(e.target.checked)} /> Schedule Later
        </label>
        {scheduleLater && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
        )}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editing ? "Update" : "Create"} Announcement
        </button>
      </form>

      <button
        onClick={handleSendTop5Email}
        className="mt-4 mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Send Top 5 Liked Announcements via Email
      </button>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Message</th>
              <th className="text-center p-2">Created</th>
              <th className="text-center p-2">Likes</th>
              <th className="text-center p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.title}</td>
                <td className="p-2">{a.message}</td>
                <td className="text-center p-2">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="text-center p-2">{a.likes ?? 0}</td>
                <td className="text-center p-2">
                  <button onClick={() => {
                    setEditing(a);
                    setTitle(a.title);
                    setMessage(a.message);
                    setScheduleLater(!!a.scheduledAt);
                    setScheduledAt(a.scheduledAt?.slice(0, 16) ?? "");
                  }} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-500 py-4">No announcements found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

{upcoming.length > 0 && (
  <div className="mt-10 bg-white shadow p-6 rounded">
    <h3 className="text-xl font-semibold mb-4 text-yellow-700">Upcoming Scheduled Announcements</h3>
    <table className="w-full text-sm">
      <thead className="bg-yellow-100">
        <tr>
          <th className="text-left p-2">Title</th>
          <th className="text-left p-2">Message</th>
          <th className="text-center p-2">Scheduled At</th>
          <th className="text-center p-2">Likes</th>
        </tr>
      </thead>
      <tbody>
        {upcoming.map((a) => (

          
          <tr key={a.id} className="border-t">
            <td className="p-2">{a.title}
               {upcomingIds.has(a.id) && (
    <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
      Scheduled
    </span>
  )}
            </td>
            <td className="p-2">{a.message}</td>
            <td className="text-center p-2">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : "-"}</td>
            <td className="text-center p-2">{a.likes ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}



      {announcements.length > 0 && (
  <div className="mt-10 bg-white shadow p-6 rounded">
    <h3 className="text-xl font-semibold mb-4">Likes per Announcement</h3>
    <Bar
      data={{
        labels: announcements.map((a) =>
          a.title.length > 20 ? a.title.slice(0, 20) + "…" : a.title
        ),
        datasets: [
          {
            label: "Likes",
            data: announcements.map((a) => a.likes ?? 0),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  </div>
)}

    </div>
  );
}
