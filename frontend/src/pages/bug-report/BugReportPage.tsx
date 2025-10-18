import { useState } from 'react';

export default function BugReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !steps) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, stepsToReprod: steps }),
      });

      if (res.ok) {
        // Generate random 8-digit ticket ID
        const data = await res.json();
        setMessage(`Bug report submitted successfully. Ticket ID: ${data.ticketId}`);
        setTitle('');
        setDescription('');
        setSteps('');
      } else {
        setMessage('Failed to submit report.');
        setTicketId('');
      }
    } catch {
      setMessage('Error connecting to server.');
      setTicketId('');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Report a Bug</h2>

        <input
          type="text"
          placeholder="Bug Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded h-24"
          required
        />

        <textarea
          placeholder="Steps to Reproduce"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          className="w-full p-2 border rounded h-24"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 font-medium mt-2">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
