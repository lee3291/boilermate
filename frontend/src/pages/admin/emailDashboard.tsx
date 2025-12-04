import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { exportToPDF } from '@/utils/exportPDF';


const API_URL = 'http://localhost:3000/email';

const EmailDashboard = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ACTIVE');
  const [userEmail, setUserEmail] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/logs`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
        setFilteredLogs(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const sendEmail = async () => {
    setStatus('idle');
    setErrorMsg('');

    const payload = {
      title,
      message,
      group: userEmail ? undefined : selectedGroup,
      toEmail: userEmail || undefined,
    };

    try {
      const res = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultText = await res.text();

      let result;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        throw new Error('Invalid JSON response from server.');
      }

      if (!res.ok) throw new Error(result.message || 'Email failed to send.');

      await fetchLogs();
      setStatus('success');
      setTitle('');
      setMessage('');
      setUserEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const lower = value.toLowerCase();
    const filtered = logs.filter((log) =>
      log.title.toLowerCase().includes(lower) ||
      log.message.toLowerCase().includes(lower)
    );
    setFilteredLogs(filtered);
  };

  const exportCSV = () => {
    const csv = [
      ['Title', 'Message', 'Group', 'To Email', 'Sent At'],
      ...filteredLogs.map((log) => [
        log.title,
        log.message,
        log.group || '',
        log.toEmail || '',
        new Date(log.sentAt).toLocaleString()
      ])
    ];
    const blob = new Blob([csv.map(row => row.join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    saveAs(blob, 'email_logs.csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    filteredLogs.forEach((log, i) => {
      const y = 10 + i * 30;
      doc.text(`Title: ${log.title}`, 10, y);
      doc.text(`Message: ${log.message}`, 10, y + 10);
      doc.text(`Group: ${log.group || ''}`, 10, y + 20);
      doc.text(`To Email: ${log.toEmail || ''}`, 10, y + 30);
    });
    doc.save('email_logs.pdf');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Email Dashboard</h1>

      {status === 'error' && (
        <p className="text-red-500">❌ Failed to send: {errorMsg}</p>
      )}
      {status === 'success' && (
        <p className="text-green-600">✅ Email sent successfully.</p>
      )}

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Send Email</h2>
        <input
          className="border w-full mb-2 p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          className="border w-full mb-2 p-2"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
        />
        <div className="flex gap-2 mb-2">
          <select
            className="border p-2"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={userEmail !== ''}
          >
            <option value="ACTIVE">Group: Active</option>
            <option value="SUSPENDED">Group: Suspended</option>
            <option value="VERIFIED">Group: Verified</option>
          </select>
          <input
            className="border p-2 flex-1"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Or enter single user email"
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={sendEmail}
        >
          Send Email
        </button>
      </div>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Search logs by title/message"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="flex gap-2 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={exportCSV}
        >
          Export CSV
        </button>
        <button onClick={() => exportToPDF(logs)}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        
        >
          Export PDF
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Group</th>
            <th className="p-2 border">To Email</th>
            <th className="p-2 border">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, i) => (
            <tr key={i}>
              <td className="p-2 border">{log.title}</td>
              <td className="p-2 border">{log.message}</td>
              <td className="p-2 border">{log.group || '-'}</td>
              <td className="p-2 border">{log.toEmail || '-'}</td>
              <td className="p-2 border">
                {new Date(log.sentAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailDashboard;
