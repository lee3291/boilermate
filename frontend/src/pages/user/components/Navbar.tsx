import accountIcon from '@/assets/images/account.png';
import { useAuth } from '../../../contexts/AuthContext';

export default function Navbar() {
  type navItem = { label: string; href: string };

  const NAV_ITEMS: navItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Listings', href: '/listings' },
    { label: 'Roommates', href: '/roommates' },
    { label: 'Messages', href: '/messages' },
  ];

  const { user: authUser, logout } = useAuth();
  const handleSignOut = () => {
    logout();
    window.location.href = '/signin';
  };

  const displayName = (() => {
    if (!authUser) return 'Account';
    const maybeUsername =
      (authUser as any).username ?? (authUser as any).displayName;
    if (typeof maybeUsername === 'string' && maybeUsername.trim())
      return maybeUsername.trim();
    if (
      typeof (authUser as any).email === 'string' &&
      (authUser as any).email.includes('@')
    ) {
      return (authUser as any).email.split('@')[0].trim();
    }
    if ((authUser as any).id) return String((authUser as any).id);
    return 'Account';
  })();

  return (
    <div className='w-full pt-7'>
      <div className='absolute top-8 left-1/2 h-16 w-[92%] -translate-x-1/2 rounded-2xl bg-black/20 blur-[5px]' />

      <nav className='relative z-10 mx-auto h-16 w-[92%] rounded-2xl border bg-white px-4 md:px-6'>
        <div className='flex h-full items-center justify-between gap-4'>
          <a
            className='cursor-pointer font-serif text-[22px] tracking-tight select-none'
            href='/'
          >
            BoilerMate
          </a>

          <ul className='hidden items-center gap-6 text-[16px] md:flex'>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className='text-gray-600 transition-colors hover:text-black'
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className='flex items-center gap-4'>
            <a href='/profile' className='flex items-center gap-2'>
              <img src={accountIcon} className='h-6 w-auto' />
              <p className='font-sans text-[16px]'>{displayName}</p>
            </a>
            <button
              onClick={handleSignOut}
              className='flex items-center gap-2 rounded bg-transparent px-0 py-0 font-sans text-[14px] text-black transition-colors hover:opacity-80 focus:outline-none'
              style={{ minWidth: '70px' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-auto'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1'
                />
              </svg>
              <p className='font-sans text-[14px]'>Sign Out</p>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
