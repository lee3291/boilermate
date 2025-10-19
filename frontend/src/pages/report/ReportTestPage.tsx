import { useNavigate } from 'react-router-dom';

export default function ReportTestPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 space-y-4">
      <button
        onClick={() => navigate('/report')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
      >
        Report User
      </button>

      <button
        onClick={() => navigate('/bug-report')}
        className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700"
      >
        Report Bug
      </button>
    </div>
  );
}
