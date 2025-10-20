import accountIcon from '@/assets/images/account.png';
import { useUser } from '../listings/temp/UserContext';

export default function Navbar() {
  type navItem = { label: string; href: string };

  const NAV_ITEMS: navItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Listings', href: '/listings' },
    { label: 'Roomates', href: '/roomates' },
    { label: 'Messages', href: '/messages' },
  ];

  const { user } = useUser();

  return (
    <div className='sticky top-0 z-50 w-full pt-7'>
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
              <li>
                <a
                  href={item.href}
                  className='text-gray-600 transition-colors hover:text-black'
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a href='/temp-account' className='flex items-center gap-2'>
            <img src={accountIcon} className='h-6 w-auto' />
            <p className='font-sans text-[16px]'>{user?.username || 'Account'}</p>
          </a>
        </div>
      </nav>
    </div>
  );
}
