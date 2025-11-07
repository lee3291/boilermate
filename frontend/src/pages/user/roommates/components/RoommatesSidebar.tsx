interface RoommatesSidebarProps {
  viewMode: 'search' | 'favorites' | 'liked' | 'disliked';
  onSetViewMode: (mode: 'search' | 'favorites' | 'liked' | 'disliked') => void;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
}

export default function RoommatesSidebar({
  viewMode,
  onSetViewMode,
  total,
  page,
  pageSize,
  loading,
}: RoommatesSidebarProps) {
  return (
    <div className='w-80 flex-shrink-0'>
      <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
        <h3 className='font-sourceserif4-18pt-regular text-maingray text-[28px] font-extralight tracking-[-0.02em] mb-5'>
          View
        </h3>
        
        {/* Search Mode Button */}
        <button
          onClick={() => onSetViewMode('search')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            viewMode === 'search'
              ? 'bg-blue-50 border-blue-300 text-blue-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>🔍 Search Roommates</span>
            {viewMode === 'search' && <span className='text-2xl'>✓</span>}
          </div>
        </button>

        {/* Favorites Mode Button */}
        <button
          onClick={() => onSetViewMode('favorites')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            viewMode === 'favorites'
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>❤️ My Favorites</span>
            {viewMode === 'favorites' && <span className='text-2xl'>✓</span>}
          </div>
          {viewMode === 'favorites' && (
            <p className='text-sm text-red-700 mt-2'>{total} favorite{total !== 1 ? 's' : ''}</p>
          )}
        </button>

        {/* Liked Mode Button */}
        <button
          onClick={() => onSetViewMode('liked')}
          className={`w-full p-4 rounded-lg border-2 transition mb-3 ${
            viewMode === 'liked'
              ? 'bg-green-50 border-green-300 text-green-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>👍 Liked</span>
            {viewMode === 'liked' && <span className='text-2xl'>✓</span>}
          </div>
          {viewMode === 'liked' && (
            <p className='text-sm text-green-700 mt-2'>{total} liked</p>
          )}
        </button>

        {/* Disliked Mode Button */}
        <button
          onClick={() => onSetViewMode('disliked')}
          className={`w-full p-4 rounded-lg border-2 transition ${
            viewMode === 'disliked'
              ? 'bg-orange-50 border-orange-300 text-orange-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold'>👎 Disliked</span>
            {viewMode === 'disliked' && <span className='text-2xl'>✓</span>}
          </div>
          {viewMode === 'disliked' && (
            <p className='text-sm text-orange-700 mt-2'>{total} disliked</p>
          )}
        </button>

        {viewMode === 'search' && (
          <div className='mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-sm text-gray-600'>
              Click the heart icon to favorite or thumbs up/down to vote!
            </p>
          </div>
        )}

        {/* Stats */}
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='text-sm text-gray-500 mb-2'>
            {viewMode === 'favorites' ? 'Favorites' : viewMode === 'liked' ? 'Liked' : viewMode === 'disliked' ? 'Disliked' : 'Search Results'}
          </div>
          {!loading && (
            <div className='text-base font-semibold text-gray-800'>
              {total > 0 ? ((page - 1) * pageSize + 1) : 0}-
              {Math.min(page * pageSize, total)} of {total}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
