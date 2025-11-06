import { useState, useEffect } from 'react';
import { getVerificationRequests } from '@/services/verification.service';
import type {
  VerificationRequest,
  VerificationStatus,
} from '@/types/verification';
import VerificationReviewModal from '@/components/VerificationReviewModal';
import Navbar from '../user/components/Navbar';

const VerificationDashboard = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'ALL'>(
    'ALL',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRequests = await getVerificationRequests(
          statusFilter === 'ALL' ? undefined : statusFilter,
        );
        setRequests(fetchedRequests);
      } catch (err) {
        setError('Failed to fetch verification requests.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter]);

  const handleModalClose = () => {
    setSelectedRequest(null);
  };

  const handleUpdateRequest = (updatedRequest: VerificationRequest) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === updatedRequest.id ? updatedRequest : req,
      ),
    );
  };

  const statusColors: Record<VerificationStatus, string> = {
    PENDING: 'text-yellow-500',
    APPROVED: 'text-green-500',
    DECLINED: 'text-red-500',
  };

  return (
    <div className='bg-mainbrown min-h-screen'>
      <Navbar />
      <div className='text-maingray container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>Verification Requests</h1>
        <div className='mb-4'>
          <label htmlFor='status-filter' className='mr-2'>
            Filter by status:
          </label>
          <select
            id='status-filter'
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as VerificationStatus | 'ALL')
            }
            className='bg-sharkgray-light text-maingray rounded border border-gray-600 p-2'
          >
            <option value='ALL'>All</option>
            <option value='PENDING'>Pending</option>
            <option value='APPROVED'>Approved</option>
            <option value='DECLINED'>Declined</option>
          </select>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        {!isLoading && !error && (
          <div className='overflow-x-auto'>
            <table className='bg-sharkgray-light min-w-full border border-gray-700'>
              <thead>
                <tr className='border-b border-gray-700'>
                  <th className='p-3 text-left'>User</th>
                  <th className='p-3 text-left'>Email</th>
                  <th className='p-3 text-left'>Status</th>
                  <th className='p-3 text-left'>Submitted At</th>
                  <th className='p-3 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className='border-b border-gray-700'>
                    <td className='p-3'>
                      {req.user.profileInfo?.name || 'N/A'}
                    </td>
                    <td className='p-3'>{req.user.email}</td>
                    <td
                      className={`p-3 font-semibold ${
                        statusColors[req.status]
                      }`}
                    >
                      {req.status}
                    </td>
                    <td className='p-3'>
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className='p-3'>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className='text-blue-400 hover:underline'
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRequest && (
          <VerificationReviewModal
            request={selectedRequest}
            onClose={handleModalClose}
            onUpdate={handleUpdateRequest}
          />
        )}
      </div>
    </div>
  );
};

export default VerificationDashboard;
