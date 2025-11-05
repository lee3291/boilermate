export const VerifiedBadge = ({ className }: { className?: string }) => {
  return (
    <div className="group relative inline-flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 text-blue-500 ${className}`}
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div className="absolute bottom-full mb-2 hidden w-max rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
        Verified User
      </div>
    </div>
  );
};
