/**
 * CompareCart Component
 * Fixed position cart at bottom-right showing selected users for comparison
 * Only visible on RoommatesPage
 */

import { X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompareCartProps {
  users: Array<{ id: string; email: string }>;
  onRemove: (userId: string) => void;
  onClear: () => void;
}

export default function CompareCart({ users, onRemove, onClear }: CompareCartProps) {
  const navigate = useNavigate();

  // Don't show if no users selected
  if (users.length === 0) return null;

  const handleCompare = () => {
    navigate('/roommates/compare');
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {/* Cart container */}
      <div className='bg-white rounded-lg shadow-2xl border border-gray-200 w-80'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg'>
          <div className='flex items-center gap-2'>
            <Users size={18} className='text-blue-600' />
            <h3 className='font-semibold text-gray-900'>
              Compare ({users.length}/3)
            </h3>
          </div>
          <button
            onClick={onClear}
            className='text-gray-500 hover:text-red-600 transition-colors text-sm'
            title='Clear all'
          >
            Clear All
          </button>
        </div>

        {/* Selected users list */}
        <div className='p-3 max-h-64 overflow-y-auto'>
          {users.map((user) => (
            <div
              key={user.id}
              className='flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg mb-2 last:mb-0'
            >
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                {/* Avatar */}
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 flex-shrink-0'>
                  {user.email[0].toUpperCase()}
                </div>
                {/* Email */}
                <span className='text-sm text-gray-700 truncate'>
                  {user.email}
                </span>
              </div>
              {/* Remove button */}
              <button
                onClick={() => onRemove(user.id)}
                className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0'
                title='Remove'
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Compare button */}
        <div className='p-3 border-t border-gray-200'>
          <button
            onClick={handleCompare}
            disabled={users.length < 2}
            className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
              users.length < 2
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {users.length < 2 ? 'Select at least 2 users' : 'Compare Profiles'}
          </button>
        </div>
      </div>
    </div>
  );
}
