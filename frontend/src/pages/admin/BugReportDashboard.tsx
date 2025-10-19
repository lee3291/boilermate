import { useEffect, useState } from "react";

type BugReport = {
  id: number;
  title: string;
  description: string;
  stepsToReprod: string;
  status: string;
  createdAt: string;
};

export default function BugReportsDashboard() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [message, setMessage] = useState("");

  // Try fetching data, but still display UI even if error occurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/bug-report");
        if (!res.ok) throw new Error("Failed to fetch bug reports");

        const data = await res.json();
        setBugs(data);
      } catch (err) {
        console.error(err);
        setMessage("Could not connect to server. Showing sample data.");

        // Display mock sample data so UI works
        setBugs([
          {
            id: 10000123,
            title: "Login form not responding",
            description: "User cannot log in after clicking submit.",
            stepsToReprod: "Go to login → Enter credentials → Click submit.",
            status: "open",
            createdAt: new Date().toISOString(),
          },
          {
            id: 10000124,
            title: "Dashboard chart not loading",
            description: "Chart remains blank on dashboard.",
            stepsToReprod: "Log in as admin → Visit dashboard.",
            status: "resolved",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-center">Bug Reports Dashboard</h2>

      {message && (
        <p className="text-center text-red-500 mb-4">{message}</p>
      )}

      <table className="w-full border text-sm bg-white rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Ticket ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr
              key={b.id}
              onClick={() => setSelected(b)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="border p-2 text-center">{b.id}</td>
              <td className="border p-2">{b.title}</td>
              <td className="border p-2 text-center capitalize">{b.status}</td>
              <td className="border p-2 text-center">
                {new Date(b.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="mt-6 bg-white border rounded-lg shadow-sm p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold mb-3">{selected.title}</h3>
          <p className="mb-2">
            <strong>Description:</strong> {selected.description}
          </p>
          <p className="mb-2">
            <strong>Steps to Reproduce:</strong> {selected.stepsToReprod}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {selected.status}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selected.createdAt).toLocaleString()}
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
