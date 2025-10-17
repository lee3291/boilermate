import { useEffect, useState } from "react";

type UserReport = {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reason: string;
  comments: string;
  status: string;
  createdAt: string;
};

export default function UserReportsDashboard() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selected, setSelected] = useState<UserReport | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:3000/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setMessage("Could not connect to server. Showing sample reports.");

        // Mock data for testing
        setReports([
          {
            id: 101,
            reporterId: 12,
            reportedUserId: 25,
            reason: "Toxic Behavior",
            comments: "This user kept sending rude messages.",
            status: "unresolved",
            createdAt: new Date().toISOString(),
          },
          {
            id: 102,
            reporterId: 19,
            reportedUserId: 32,
            reason: "Spam",
            comments: "They kept posting the same ad multiple times.",
            status: "unresolved",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchReports();
  }, []);

  // Update report status locally
  const handleStatusChange = (id: number, newStatus: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selected) setSelected({ ...selected, status: newStatus });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-center">User Reports Dashboard</h2>

      {message && <p className="text-center text-red-500 mb-4">{message}</p>}

      <table className="w-full border text-sm bg-white rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Report ID</th>
            <th className="border p-2">Reporter</th>
            <th className="border p-2">Reported User</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr
              key={r.id}
              onClick={() => setSelected(r)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="border p-2 text-center">{r.id}</td>
              <td className="border p-2 text-center">{r.reporterId}</td>
              <td className="border p-2 text-center">{r.reportedUserId}</td>
              <td className="border p-2">{r.reason}</td>
              <td
                className={`border p-2 text-center capitalize ${
                  r.status === "accepted"
                    ? "text-green-600"
                    : r.status === "declined"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {r.status}
              </td>
              <td className="border p-2 text-center">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="mt-6 bg-white border rounded-lg shadow-sm p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold mb-3">Report #{selected.id}</h3>
          <p className="mb-2">
            <strong>Reporter ID:</strong> {selected.reporterId}
          </p>
          <p className="mb-2">
            <strong>Reported User ID:</strong> {selected.reportedUserId}
          </p>
          <p className="mb-2">
            <strong>Reason:</strong> {selected.reason}
          </p>
          <p className="mb-2">
            <strong>Comments:</strong> {selected.comments}
          </p>
          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span
              className={`font-semibold ${
                selected.status === "accepted"
                  ? "text-green-600"
                  : selected.status === "declined"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {selected.status}
            </span>
          </p>

          {/* Dropdown for accept/decline */}
          <label className="block mt-4 font-medium text-gray-700">
            Update Status:
            <select
              value={selected.status}
              onChange={(e) =>
                handleStatusChange(selected.id, e.target.value)
              }
              className="w-full p-2 mt-1 border rounded"
            >
              <option value="unresolved">Unresolved</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </label>

          <p className="mt-3 text-sm text-gray-600">
            Created At: {new Date(selected.createdAt).toLocaleString()}
          </p>

          <button
            onClick={() => setSelected(null)}
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
