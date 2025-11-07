import React, { useState } from "react";
import axios from "axios";

export default function ReportBug() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    steps: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const API_BASE = "http://localhost:3000/bug-report";

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.steps || !form.userId) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(API_BASE, form);
      setTicketId(res.data.id);
      alert(`Bug Report Submitted! Ticket ID: ${res.data.id}`);
      setForm({ title: "", description: "", steps: "", userId: "" });
    } catch {
      alert("Error submitting report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Report a Bug</h1>
      <div className="space-y-4">
        <input placeholder="Bug Title" className="border p-2 w-full"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
        <textarea placeholder="Description" className="border p-2 w-full"
          rows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}/>
        <textarea placeholder="Steps to Reproduce" className="border p-2 w-full"
          rows={3} value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}/>
        <input placeholder="Purdue ID (e.g. jang123)" className="border p-2 w-full"
          value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}/>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
        {ticketId && <p className="text-green-600 mt-2">Ticket ID: {ticketId}</p>}
      </div>
    </div>
  );
}
