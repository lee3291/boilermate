export const VerifiedBadge = ({ className }: { className?: string }) => {
  return (
    <div className={`group relative inline-flex items-center ${className}`}>
      <span
        className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-400'
        style={{ position: 'relative', left: '-6px', top: '4px' }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='white'
          className='h-3.5 w-3.5'
        >
          <path
            fillRule='evenodd'
            d='M16.707 6.293a1 1 0 00-1.414 0L9 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z'
            clipRule='evenodd'
          />
        </svg>
      </span>
      <div className='absolute bottom-full mb-2 hidden w-max rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:block'>
        Verified User
      </div>
    </div>
  );
};
