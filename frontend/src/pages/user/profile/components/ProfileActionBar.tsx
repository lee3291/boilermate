import React from 'react';

interface ProfileActionBarProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    type?: 'primary' | 'secondary';
  }>;
}

export default function ProfileActionBar({ actions }: ProfileActionBarProps) {
  return (
    <div className='mt-10 mb-4 flex flex-col items-center justify-center gap-4 rounded-xl bg-white p-6 shadow-lg'>
      <div className='flex flex-wrap justify-center gap-4'>
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`rounded-full px-6 py-2 font-medium text-white shadow-md transition-shadow hover:scale-105 hover:shadow-lg ${
              action.type === 'secondary'
                ? 'bg-linear-to-r from-red-500 to-pink-500'
                : 'bg-linear-to-r from-pink-500 to-purple-500'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
