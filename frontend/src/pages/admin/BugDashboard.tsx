import React, { useEffect, useState } from "react";
import axios from "axios";

interface BugReport {
  id: string;
  title: string;
  description: string;
  steps: string;
  userId: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export default function BugReportDashboard() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<BugReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:3000/bug-report");
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  // 🔍 Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredReports(reports);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = reports.filter(
      (r) =>
        r.id.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.userId.toLowerCase().includes(term)
    );
    setFilteredReports(results);
  }, [searchTerm, reports]);

  // ✅ Update Status / Priority
  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await axios.put(`http://localhost:3000/bug-report/${id}`, {
        [field]: value,
      });
      setSuccessMsg(`Updated ${field} for ticket ${id.slice(0, 8)}...`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchReports();
    } catch (err) {
      alert("Failed to update report.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "text-red-600 font-semibold";
      case "MEDIUM":
        return "text-yellow-600 font-semibold";
      case "LOW":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🐞 Admin Bug Report Dashboard</h1>

      {/* ✅ Success message */}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3">
          {successMsg}
        </div>
      )}

      {/* 🔍 Search */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by Ticket ID, Title, or User ID..."
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

      {/* ====== Table ====== */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Ticket ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Steps</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Priority</th>
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
              <td className="border p-2 font-semibold">{r.title}</td>
              <td className="border p-2">{r.description}</td>
              <td className="border p-2 text-gray-700">{r.steps}</td>
              <td className="border p-2">{r.userId}</td>

              {/* Editable Status */}
              <td className="border p-2">
                <select
                  value={r.status}
                  onChange={(e) => handleUpdate(r.id, "status", e.target.value)}
                  className="border rounded p-1"
                >
                  <option>OPEN</option>
                  <option>IN_PROGRESS</option>
                  <option>RESOLVED</option>
                  <option>CLOSED</option>
                </select>
              </td>

              {/* Editable Priority */}
              <td className={`border p-2 ${getPriorityColor(r.priority)}`}>
                <select
                  value={r.priority || "MEDIUM"}
                  onChange={(e) => handleUpdate(r.id, "priority", e.target.value)}
                  className={`border rounded p-1 ${getPriorityColor(r.priority)}`}
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
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
              <td colSpan={9} className="text-center text-gray-500 py-4 border">
                No reports found for "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ====== Detail Section ====== */}
      {selected && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Bug Details</h2>
          <p><strong>Ticket ID:</strong> {selected.id}</p>
          <p><strong>Title:</strong> {selected.title}</p>
          <p><strong>Description:</strong> {selected.description}</p>
          <p><strong>Steps:</strong> {selected.steps}</p>
          <p><strong>User:</strong> {selected.userId}</p>
          <p><strong>Status:</strong> {selected.status}</p>
          <p><strong>Priority:</strong> {selected.priority}</p>
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
