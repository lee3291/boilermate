import React, { useState } from "react";
import axios from "axios";

export default function UserReportForm() {
  const [form, setForm] = useState({
    userId: "",
    reportedUserId: "",
    reason: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.userId || !form.reportedUserId || !form.reason || !form.comments) {
      alert("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/user-report", form);

      //  Show ticket ID from backend response
      const id = res.data.id;
      setTicketId(id);

      alert(`Report submitted successfully! Your Ticket ID: ${id}`);

      // Reset form
      setForm({ userId: "", reportedUserId: "", reason: "", comments: "" });
    } catch {
      alert("Error submitting user report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Report Form</h1>

      <div className="space-y-4">
        <input
          placeholder="Your Purdue ID"
          className="border p-2 w-full"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
        />

        <input
          placeholder="Reported User ID"
          className="border p-2 w-full"
          value={form.reportedUserId}
          onChange={(e) =>
            setForm({ ...form, reportedUserId: e.target.value })
          }
        />

        <select
          className="border p-2 w-full"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        >
          <option value="">Select Reason</option>
          <option value="Toxic Behavior">Toxic Behavior</option>
          <option value="Spam or Scam">Spam or Scam</option>
          <option value="Inappropriate Listing">Inappropriate Listing</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          placeholder="Additional comments..."
          className="border p-2 w-full"
          rows={3}
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>

        {/*  Ticket ID message */}
        {ticketId && (
          <p className="text-green-600 mt-3">
            Your report has been submitted. Ticket ID:{" "}
            <span className="font-semibold">{ticketId}</span>
          </p>
        )}
      </div>
    </div>
  );
}
