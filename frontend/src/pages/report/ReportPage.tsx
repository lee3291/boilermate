import { useState, useEffect } from 'react';

export default function ReportPage() {
  const [reporterId, setReporterId] = useState('');
  const [reportedUserId, setReportedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill reporterId from localStorage (assume it's saved during login)
  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) setReporterId(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!reason || !comments.trim()) {
      setMessage('Please fill all required fields.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: Number(reporterId),
          reportedUserId: Number(reportedUserId),
          reason,
          comments,
        }),
      });

      if (res.ok) {
        setMessage('Report submitted successfully!');
        setReportedUserId('');
        setReason('');
        setComments('');
        setSubmitted(false);
      } else {
        setMessage('Failed to submit report.');
      }
    } catch {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Submit a Report</h2>

        {/* Reported user ID field */}
        <input
          type="number"
          placeholder="Reported User ID"
          value={reportedUserId}
          onChange={(e) => setReportedUserId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* Reason dropdown */}
        <label className="block text-gray-700 font-medium">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`w-full p-2 border rounded mt-1 ${
              !reason && submitted ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select a reason</option>
            <option value="Spam">Spam</option>
            <option value="Toxic Behavior">Toxic Behavior</option>
            <option value="Scam or Fraud">Scam or Fraud</option>
            <option value="Inappropriate Listing">Inappropriate Listing</option>
            <option value="Other">Other</option>
          </select>
          {!reason && submitted && (
            <p className="text-red-500 text-sm mt-1">Reason is required.</p>
          )}
        </label>

        {/* Comments textarea */}
        <label className="block text-gray-700 font-medium">
          Comments
          <textarea
            placeholder="Write your comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={`w-full p-2 border rounded h-24 mt-1 ${
              !comments.trim() && submitted ? 'border-red-500' : ''
            }`}
          />
          {!comments.trim() && submitted && (
            <p className="text-red-500 text-sm mt-1">
              Comments are required.
            </p>
          )}
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
}
