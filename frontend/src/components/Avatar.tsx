import React from 'react';

interface AvatarProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  className = 'h-32 w-32 rounded-full object-cover',
}) => {
  if (src) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={className}>
      <svg
        className='h-full w-full text-gray-300'
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
      >
        <circle cx='12' cy='12' r='12' />
        <path
          d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
          fill='#A0AEC0'
        />
      </svg>
    </div>
  );
};

export default Avatar;
