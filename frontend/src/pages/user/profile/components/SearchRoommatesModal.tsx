/**
 * SearchRoommatesModal - Modal for searching and sending roommate requests
 * 
 * Features:
 * - Search input with debouncing (500ms delay)
 * - Displays search results with user cards
 * - Send roommate request button
 * - Loading states and error handling
 * - Empty state when no results
 * 
 * Props:
 * - open: Boolean to show/hide modal
 * - onClose: Callback to close modal
 * - currentUserId: Current user's ID (to exclude from search)
 * - onRequestSent: Callback after successfully sending request
 */

import { useState, useEffect, useCallback } from 'react';
import { searchUsersForRoommate, sendRoommateRequest } from '@/services/roommatesService';
import type { RoommateUser } from '@/types/roommates';

interface SearchRoommatesModalProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  onRequestSent: () => void;
}

export default function SearchRoommatesModal({
  open,
  onClose,
  currentUserId,
  onRequestSent,
}: SearchRoommatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchUsersForRoommate({
          userId: currentUserId,
          query: searchQuery.trim(),
        });
        setSearchResults(response.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search users');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
      setSendingRequestTo(null);
      setSelectedUser(null);
      setStartDate('');
      setEndDate('');
      setMessage('');
    }
  }, [open]);

  const [selectedUser, setSelectedUser] = useState<RoommateUser | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSendRequest = useCallback(async () => {
    if (!selectedUser || !startDate) return;
    
    setSendingRequestTo(selectedUser.id);
    setError(null);
    try {
      await sendRoommateRequest({
        requesterId: currentUserId,
        requestedId: selectedUser.id,
        message: message.trim() || undefined,
        startDate: startDate,
        endDate: endDate || undefined,
      });
      // Remove user from search results after sending request
      setSearchResults(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setStartDate('');
      setEndDate('');
      setMessage('');
      onRequestSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSendingRequestTo(null);
    }
  }, [currentUserId, selectedUser, startDate, endDate, message, onRequestSent]);

  if (!open) return null;

  // If user is selected, show request form
  if (selectedUser) {
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
        <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4'>
          {/* Header */}
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>📤 Send Request</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className='text-gray-400 hover:text-gray-600 text-2xl font-bold'
              >
                ×
              </button>
            </div>
            
            {/* Selected User Info */}
            <div className='flex items-center gap-3 p-3 bg-purple-50 rounded-lg'>
              <div className='w-12 h-12 rounded-full bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold overflow-hidden'>
                {selectedUser.avatarURL ? (
                  <img src={selectedUser.avatarURL} alt={selectedUser.legalName || selectedUser.email} className='w-full h-full object-cover' />
                ) : (
                  (selectedUser.legalName || selectedUser.email).charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>{selectedUser.legalName || selectedUser.email}</h3>
                <p className='text-sm text-gray-600'>{selectedUser.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className='p-6 space-y-4'>
            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-600'>⚠️ {error}</p>
              </div>
            )}

            {/* Start Date (Required) */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Start Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>When would you like to start rooming together?</p>
            </div>

            {/* End Date (Optional) */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                End Date <span className='text-gray-400'>(Optional)</span>
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>Leave empty if open-ended</p>
            </div>

            {/* Message (Optional) */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Message <span className='text-gray-400'>(Optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Add a personal note...'
                rows={3}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <button
                onClick={() => setSelectedUser(null)}
                className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold'
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!startDate || sendingRequestTo === selectedUser.id}
                className='flex-1 px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
              >
                {sendingRequestTo === selectedUser.id ? (
                  <span className='flex items-center justify-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Sending...
                  </span>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search view
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-800'>🔍 Search Roommates</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 text-2xl font-bold'
            >
              ×
            </button>
          </div>
          
          {/* Search Input */}
          <input
            type='text'
            placeholder='Search by name or email...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            autoFocus
          />
        </div>

        {/* Results Container */}
        <div className='flex-1 overflow-y-auto p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>⚠️ {error}</p>
            </div>
          )}

          {loading && (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
            </div>
          )}

          {!loading && searchQuery.trim() === '' && (
            <div className='text-center py-12 text-gray-500'>
              <p className='text-lg mb-2'>👋</p>
              <p>Start typing to search for potential roommates</p>
            </div>
          )}

          {!loading && searchQuery.trim() !== '' && searchResults.length === 0 && (
            <div className='text-center py-12 text-gray-500'>
              <p className='text-lg mb-2'>😕</p>
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className='space-y-4'>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'
                >
                  <div className='flex items-center gap-4'>
                    {/* Avatar */}
                    <div className='w-14 h-14 rounded-full bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden'>
                      {user.avatarURL ? (
                        <img src={user.avatarURL} alt={user.legalName || user.email} className='w-full h-full object-cover' />
                      ) : (
                        (user.legalName || user.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <h3 className='font-semibold text-gray-800'>{user.legalName || user.email}</h3>
                      <p className='text-sm text-gray-500'>{user.email}</p>
                    </div>
                  </div>

                  {/* Send Request Button */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className='px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold'
                  >
                    📤 Send Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
