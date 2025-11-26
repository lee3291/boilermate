/**
 * ProfileSidebar - Navigation sidebar for Profile page
 * Similar to RoommatesSidebar design pattern
 * 
 * Features:
 * - Tab-based navigation (Profile / Roommate / Settings)
 * - Active state highlighting with gradient backgrounds
 * - Sticky positioning for better UX
 * 
 * Props:
 * - activeTab: Current active tab
 * - onSetActiveTab: Callback to change active tab
 */

interface ProfileSidebarProps {
  activeTab: 'profile' | 'roommate' | 'reviews' | 'settings';
  onSetActiveTab: (tab: 'profile' | 'roommate' | 'reviews' | 'settings') => void;
}

export default function ProfileSidebar({
  activeTab,
  onSetActiveTab,
}: ProfileSidebarProps) {
  return (
    <div className='w-80 shrink-0'>
      <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
        <h3 className='font-sourceserif4-18pt-regular text-maingray text-[28px] font-extralight tracking-[-0.02em] mb-5'>
          Navigation
        </h3>
        
        {/* Profile Tab Button */}
        <button
          onClick={() => onSetActiveTab('profile')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            activeTab === 'profile'
              ? 'bg-linear-to-r from-blue-50 to-purple-50 border-purple-300 text-purple-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>👤 Profile</span>
            {activeTab === 'profile' && <span className='text-2xl'>✓</span>}
          </div>
          {activeTab === 'profile' && (
            <p className='text-sm text-purple-700 mt-2'>View and edit your profile</p>
          )}
        </button>

        {/* Roommate Tab Button */}
        <button
          onClick={() => onSetActiveTab('roommate')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            activeTab === 'roommate'
              ? 'bg-linear-to-r from-pink-50 to-purple-50 border-pink-300 text-pink-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>🏠 Roommate</span>
            {activeTab === 'roommate' && <span className='text-2xl'>✓</span>}
          </div>
          {activeTab === 'roommate' && (
            <p className='text-sm text-pink-700 mt-2'>Manage roommate requests</p>
          )}
        </button>

        {/* My Reviews Tab Button */}
        <button
          onClick={() => onSetActiveTab('reviews')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            activeTab === 'reviews'
              ? 'bg-linear-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>⭐ My Reviews</span>
            {activeTab === 'reviews' && <span className='text-2xl'>✓</span>}
          </div>
          {activeTab === 'reviews' && (
            <p className='text-sm text-yellow-700 mt-2'>View and manage reviews</p>
          )}
        </button>

        {/* Settings Tab Button */}
        <button
          onClick={() => onSetActiveTab('settings')}
          className={`w-full p-4 rounded-lg border-2 transition ${
            activeTab === 'settings'
              ? 'bg-linear-to-r from-gray-50 to-blue-50 border-blue-300 text-blue-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>⚙️ Settings</span>
            {activeTab === 'settings' && <span className='text-2xl'>✓</span>}
          </div>
          {activeTab === 'settings' && (
            <p className='text-sm text-blue-700 mt-2'>Account preferences</p>
          )}
        </button>

        {/* Info Section */}
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='text-sm text-gray-600'>
            {activeTab === 'profile' && '📝 Edit your bio, preferences, and personal information'}
            {activeTab === 'roommate' && '🤝 Search users, manage requests, and view current roommates'}
            {activeTab === 'reviews' && '⭐ View reviews received and reviews you have given'}
            {activeTab === 'settings' && '🔧 Configure account settings and privacy'}
          </div>
        </div>
      </div>
    </div>
  );
}
