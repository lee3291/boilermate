import React, { useEffect, useState } from "react";
import axios from "axios";

interface UserReport {
  id: string;
  userId: string;
  reportedUserId: string;
  reason: string;
  comments: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserReportDashboard() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<UserReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<UserReport | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user-report");
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  // Live filter search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredReports(reports);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = reports.filter(
      (r) =>
        r.id.toLowerCase().includes(term) ||
        r.userId.toLowerCase().includes(term) ||
        r.reportedUserId.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term)
    );
    setFilteredReports(results);
  }, [searchTerm, reports]);

  // Update report status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:3000/user-report/${id}`, {
        status: newStatus,
      });
      setSuccessMsg(`Updated report ${id.slice(0, 8)} to ${newStatus}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchReports();
    } catch (err) {
      alert("Failed to update report status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Report Dashboard</h1>

      {successMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by Ticket ID, User ID, or Reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => setSearchTerm("")}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Reports Table */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Ticket ID</th>
            <th className="border p-2">Reporter</th>
            <th className="border p-2">Reported User</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Comments</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((r) => (
            <tr
              key={r.id}
              onClick={() => setSelected(r)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="border p-2 text-xs text-gray-600">{r.id}</td>
              <td className="border p-2">{r.userId}</td>
              <td className="border p-2">{r.reportedUserId}</td>
              <td className="border p-2">{r.reason}</td>
              <td className="border p-2 text-gray-700">{r.comments}</td>
              <td className="border p-2">
                <select
                  value={r.status}
                  onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option>UNRESOLVED</option>
                  <option>IN_REVIEW</option>
                  <option>RESOLVED</option>
                  <option>CLOSED</option>
                </select>
              </td>
              <td className="border p-2 text-gray-700">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="border p-2 text-gray-700">
                {new Date(r.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
          {filteredReports.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-gray-500 py-4 border">
                No reports found for "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Detail Section */}
      {selected && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Report Details</h2>
          <p><strong>Ticket ID:</strong> {selected.id}</p>
          <p><strong>Reporter:</strong> {selected.userId}</p>
          <p><strong>Reported User:</strong> {selected.reportedUserId}</p>
          <p><strong>Reason:</strong> {selected.reason}</p>
          <p><strong>Comments:</strong> {selected.comments}</p>
          <p><strong>Status:</strong> {selected.status}</p>
          <p><strong>Created:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(selected.updatedAt).toLocaleString()}</p>

          <button
            onClick={() => setSelected(null)}
            className="mt-3 bg-gray-200 rounded px-3 py-1"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
