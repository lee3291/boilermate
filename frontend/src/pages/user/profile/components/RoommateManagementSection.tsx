/**
 * RoommateManagementSection - Full page section for managing roommates
 * Replaces the sidebar approach with a full-width tabbed interface
 * 
 * Features:
 * - Tabbed interface (Requests / Current Roommates)
 * - Search button to open SearchRoommatesModal
 * - Badge notification for pending received requests
 * - Request cards with Accept/Reject/Withdraw actions
 * - Roommate cards with End Roommate action
 * - Loading states and empty states
 * 
 * Props:
 * - requests: Array of roommate requests
 * - roommates: Array of current roommates
 * - currentUserId: Current user's ID
 * - onAcceptRequest: Handler for accepting requests
 * - onRejectRequest: Handler for rejecting requests
 * - onWithdrawRequest: Handler for withdrawing requests
 * - onEndRoommate: Handler for ending roommate relationships
 * - onRefreshRequests: Handler to refresh requests after sending new request
 * - loading: Loading state
 */

import { useState } from 'react';
import type { RoommateRequest, Roommate } from '@/types/roommates';
import SearchRoommatesModal from './SearchRoommatesModal';

interface RoommateManagementSectionProps {
  requests: RoommateRequest[];
  roommates: Roommate[];
  currentUserId: string;
  onAcceptRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onWithdrawRequest: (requestId: string) => Promise<void>;
  onEndRoommate: (roommateId: string) => Promise<void>;
  onRefreshRequests: () => Promise<void>;
  loading: boolean;
}

export default function RoommateManagementSection({
  requests,
  roommates,
  currentUserId,
  onAcceptRequest,
  onRejectRequest,
  onWithdrawRequest,
  onEndRoommate,
  onRefreshRequests,
  loading,
}: RoommateManagementSectionProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'roommates'>('requests');
  const [requestSubTab, setRequestSubTab] = useState<'pending' | 'history'>('pending');
  const [roommateSubTab, setRoommateSubTab] = useState<'active' | 'history'>('active');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Split requests into pending and history
  const pendingReceivedRequests = requests.filter(
    (r) => r.requested.id === currentUserId && r.status === 'PENDING'
  );
  const pendingSentRequests = requests.filter(
    (r) => r.requester.id === currentUserId && r.status === 'PENDING'
  );
  const historyReceivedRequests = requests.filter(
    (r) => r.requested.id === currentUserId && r.status !== 'PENDING'
  );
  const historySentRequests = requests.filter(
    (r) => r.requester.id === currentUserId && r.status !== 'PENDING'
  );

  // Count pending received requests for badge
  const pendingReceivedCount = pendingReceivedRequests.length;

  // Filter active and history roommates
  const activeRoommates = roommates.filter((r) => r.isActive);
  const historyRoommates = roommates.filter((r) => !r.isActive);

  const handleAction = async (
    action: () => Promise<void>,
    itemId: string
  ) => {
    setActionLoading(itemId);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header with Search Button */}
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold text-gray-800'>🏠 Roommate Management</h2>
        <button
          onClick={() => setShowSearchModal(true)}
          className='px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-md'
        >
          🔍 Search Roommates
        </button>
      </div>

      {/* Main Tabs */}
      <div className='flex gap-4 border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold transition relative ${
            activeTab === 'requests'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📬 Requests
          {pendingReceivedCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
              {pendingReceivedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('roommates')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'roommates'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🤝 Roommates
        </button>
      </div>

      {/* Content */}
      <div className='bg-white rounded-xl shadow-sm p-6'>
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
          </div>
        ) : activeTab === 'requests' ? (
          <div className='space-y-6'>
            {/* Sub-tabs for Requests */}
            <div className='flex gap-2 mb-4'>
              <button
                onClick={() => setRequestSubTab('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  requestSubTab === 'pending'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⏳ Pending
              </button>
              <button
                onClick={() => setRequestSubTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  requestSubTab === 'history'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📜 History
              </button>
            </div>

            {requestSubTab === 'pending' ? (
              <>
                {/* Pending Received Requests */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                    📥 Received Requests ({pendingReceivedRequests.length})
                  </h3>
                  {pendingReceivedRequests.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <p className='text-2xl mb-2'>📭</p>
                      <p>No pending received requests</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {pendingReceivedRequests.map((request) => (
                        <div
                          key={request.id}
                          className='p-4 border border-gray-200 rounded-lg bg-linear-to-r from-purple-50 to-pink-50 hover:shadow-md transition'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              {/* Avatar */}
                              <div className='w-12 h-12 rounded-full bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                                {request.requester.avatarURL ? (
                                  <img
                                    src={request.requester.avatarURL}
                                    alt={request.requester.legalName}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  (request.requester.legalName || request.requester.email).charAt(0).toUpperCase()
                                )}
                              </div>
                              {/* User Info */}
                              <div>
                                <h4 className='font-semibold text-gray-800'>
                                  {request.requester.legalName || request.requester.email}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {new Date(request.createdAt).toLocaleDateString()}
                                  {request.startDate && (
                                    <span className='ml-2'>
                                      📅 {new Date(request.startDate).toLocaleDateString()}
                                      {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString()}`}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div className='flex gap-2'>
                              <button
                                onClick={() =>
                                  handleAction(
                                    () => onAcceptRequest(request.id),
                                    `accept-${request.id}`
                                  )
                                }
                                disabled={actionLoading === `accept-${request.id}`}
                                className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-semibold'
                              >
                                {actionLoading === `accept-${request.id}` ? '...' : '✅ Accept'}
                              </button>
                              <button
                                onClick={() =>
                                  handleAction(
                                    () => onRejectRequest(request.id),
                                    `reject-${request.id}`
                                  )
                                }
                                disabled={actionLoading === `reject-${request.id}`}
                                className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 font-semibold'
                              >
                                {actionLoading === `reject-${request.id}` ? '...' : '❌ Reject'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Sent Requests */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                    📤 Sent Requests ({pendingSentRequests.length})
                  </h3>
                  {pendingSentRequests.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <p className='text-2xl mb-2'>📭</p>
                      <p>No pending sent requests</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {pendingSentRequests.map((request) => (
                    <div
                      key={request.id}
                      className='p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          {/* Avatar */}
                          <div className='w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                            {request.requested.avatarURL ? (
                              <img
                                src={request.requested.avatarURL}
                                alt={request.requested.legalName}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              (request.requested.legalName || request.requested.email).charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* User Info */}
                          <div>
                            <h4 className='font-semibold text-gray-800'>
                              {request.requested.legalName || request.requested.email}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {new Date(request.createdAt).toLocaleDateString()}
                              {request.startDate && (
                                <span className='ml-2'>
                                  📅 {new Date(request.startDate).toLocaleDateString()}
                                  {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString()}`}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {/* Withdraw Button */}
                        <button
                          onClick={() =>
                            handleAction(
                              () => onWithdrawRequest(request.id),
                              `withdraw-${request.id}`
                            )
                          }
                          disabled={actionLoading === `withdraw-${request.id}`}
                          className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 font-semibold'
                        >
                          {actionLoading === `withdraw-${request.id}`
                            ? '...'
                            : '🚫 Withdraw'}
                        </button>
                      </div>
                    </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // History Tab for Requests
              <div className='space-y-6'>
                {/* History Received Requests */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                    📥 Received Request History ({historyReceivedRequests.length})
                  </h3>
                  {historyReceivedRequests.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <p className='text-2xl mb-2'>📭</p>
                      <p>No request history</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {historyReceivedRequests.map((request) => (
                        <div
                          key={request.id}
                          className={`p-4 border border-gray-200 rounded-lg transition ${
                            request.status === 'ACCEPTED'
                              ? 'bg-green-50'
                              : request.status === 'REJECTED'
                              ? 'bg-red-50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <div className='w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                                {request.requester.avatarURL ? (
                                  <img
                                    src={request.requester.avatarURL}
                                    alt={request.requester.legalName}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  (request.requester.legalName || request.requester.email).charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-800'>
                                  {request.requester.legalName || request.requester.email}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {new Date(request.createdAt).toLocaleDateString()}
                                  {request.startDate && (
                                    <span className='ml-2'>
                                      📅 {new Date(request.startDate).toLocaleDateString()}
                                      {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString()}`}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                request.status === 'ACCEPTED'
                                  ? 'bg-green-200 text-green-800'
                                  : request.status === 'REJECTED'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {request.status === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* History Sent Requests */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                    📤 Sent Request History ({historySentRequests.length})
                  </h3>
                  {historySentRequests.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <p className='text-2xl mb-2'>📭</p>
                      <p>No request history</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {historySentRequests.map((request) => (
                        <div
                          key={request.id}
                          className={`p-4 border border-gray-200 rounded-lg transition ${
                            request.status === 'ACCEPTED'
                              ? 'bg-green-50'
                              : request.status === 'REJECTED'
                              ? 'bg-red-50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <div className='w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                                {request.requested.avatarURL ? (
                                  <img
                                    src={request.requested.avatarURL}
                                    alt={request.requested.legalName}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  (request.requested.legalName || request.requested.email).charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-800'>
                                  {request.requested.legalName || request.requested.email}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {new Date(request.createdAt).toLocaleDateString()}
                                  {request.startDate && (
                                    <span className='ml-2'>
                                      📅 {new Date(request.startDate).toLocaleDateString()}
                                      {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString()}`}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                request.status === 'ACCEPTED'
                                  ? 'bg-green-200 text-green-800'
                                  : request.status === 'REJECTED'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {request.status === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Roommates Tab
          <div className='space-y-6'>
            {/* Sub-tabs for Roommates */}
            <div className='flex gap-2 mb-4'>
              <button
                onClick={() => setRoommateSubTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  roommateSubTab === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✅ Active
              </button>
              <button
                onClick={() => setRoommateSubTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  roommateSubTab === 'history'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📜 History
              </button>
            </div>

            {roommateSubTab === 'active' ? (
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  🤝 Active Roommates ({activeRoommates.length})
                </h3>
                {activeRoommates.length === 0 ? (
              <div className='text-center py-12 text-gray-500'>
                <p className='text-4xl mb-4'>🏠</p>
                <p className='text-lg'>No active roommates yet</p>
                <p className='text-sm mt-2'>Search for users and send requests to get started!</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {activeRoommates.map((roommate) => {
                  const otherUser =
                    roommate.user1.id === currentUserId
                      ? roommate.user2
                      : roommate.user1;
                  return (
                    <div
                      key={roommate.id}
                      className='p-4 border border-gray-200 rounded-lg bg-linear-to-r from-green-50 to-teal-50 hover:shadow-md transition'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          {/* Avatar */}
                          <div className='w-12 h-12 rounded-full bg-linear-to-r from-green-400 to-teal-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                            {otherUser.avatarURL ? (
                              <img
                                src={otherUser.avatarURL}
                                alt={otherUser.legalName || otherUser.email}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              (otherUser.legalName || otherUser.email).charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* User Info */}
                          <div>
                            <h4 className='font-semibold text-gray-800'>
                              {otherUser.legalName || otherUser.email}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              Roommates since{' '}
                              {new Date(roommate.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {/* End Roommate Button */}
                        <button
                          onClick={() =>
                            handleAction(
                              () => onEndRoommate(roommate.id),
                              `end-${roommate.id}`
                            )
                          }
                          disabled={actionLoading === `end-${roommate.id}`}
                          className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 font-semibold'
                        >
                          {actionLoading === `end-${roommate.id}`
                            ? '...'
                            : '🚪 End Roommate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </div>
            ) : (
              // History Tab for Roommates
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-4'>
                  📜 Roommate History ({historyRoommates.length})
                </h3>
                {historyRoommates.length === 0 ? (
                  <div className='text-center py-12 text-gray-500'>
                    <p className='text-4xl mb-4'>📭</p>
                    <p className='text-lg'>No past roommates</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {historyRoommates.map((roommate) => {
                      const otherUser =
                        roommate.user1.id === currentUserId
                          ? roommate.user2
                          : roommate.user1;
                      return (
                        <div
                          key={roommate.id}
                          className='p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              {/* Avatar */}
                              <div className='w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                                {otherUser.avatarURL ? (
                                  <img
                                    src={otherUser.avatarURL}
                                    alt={otherUser.legalName || otherUser.email}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  (otherUser.legalName || otherUser.email).charAt(0).toUpperCase()
                                )}
                              </div>
                              {/* User Info */}
                              <div>
                                <h4 className='font-semibold text-gray-800'>
                                  {otherUser.legalName || otherUser.email}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {new Date(roommate.startDate).toLocaleDateString()}
                                  {' - '}
                                  {roommate.endDate
                                    ? new Date(roommate.endDate).toLocaleDateString()
                                    : 'Present'}
                                </p>
                              </div>
                            </div>
                            <span className='px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800'>
                              Ended
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchRoommatesModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentUserId={currentUserId}
        onRequestSent={async () => {
          await onRefreshRequests();
          setShowSearchModal(false);
        }}
      />
    </div>
  );
}
