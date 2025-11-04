interface RoommatesSidebarProps {
  viewMode: 'search' | 'favorites';
  onSetViewMode: (mode: 'search' | 'favorites') => void;
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
    <div className='w-64 flex-shrink-0'>
      <div className='bg-white rounded-lg shadow-sm p-5 sticky top-6'>
        <h3 className='font-sourceserif4-18pt-regular text-maingray text-[24px] font-extralight tracking-[-0.02em] mb-4'>
          View
        </h3>
        
        {/* Search Mode Button */}
        <button
          onClick={() => onSetViewMode('search')}
          className={`w-full p-3 rounded-lg border-2 transition mb-3 ${
            viewMode === 'search'
              ? 'bg-blue-50 border-blue-300 text-blue-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-sm font-semibold'>🔍 Search Roommates</span>
            {viewMode === 'search' && <span className='text-xl'>✓</span>}
          </div>
        </button>

        {/* Favorites Mode Button */}
        <button
          onClick={() => onSetViewMode('favorites')}
          className={`w-full p-3 rounded-lg border-2 transition ${
            viewMode === 'favorites'
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-sm font-semibold'>❤️ My Favorites</span>
            {viewMode === 'favorites' && <span className='text-xl'>✓</span>}
          </div>
          {viewMode === 'favorites' && (
            <p className='text-xs text-red-700 mt-1'>{total} favorite{total !== 1 ? 's' : ''}</p>
          )}
        </button>

        {viewMode === 'search' && (
          <div className='mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600'>
              Click the heart icon on any profile to add them to your favorites!
            </p>
          </div>
        )}

        {/* Stats */}
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='text-xs text-gray-500 mb-2'>
            {viewMode === 'favorites' ? 'Favorites' : 'Search Results'}
          </div>
          {!loading && (
            <div className='text-sm font-semibold text-gray-800'>
              {total > 0 ? ((page - 1) * pageSize + 1) : 0}-
              {Math.min(page * pageSize, total)} of {total}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
