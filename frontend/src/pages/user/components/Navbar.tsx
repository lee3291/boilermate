import accountIcon from '@/assets/images/account.png';
import { useAuth } from '../../../contexts/AuthContext';


export default function Navbar() {
    type navItem = { label: string; href: string };
    const { user } = useAuth();

    const NAV_ITEMS: navItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profile' , href: '/profile'},
        { label: 'Listings', href: '/listings' },
        { label: 'Roommates', href: '/roommates' },
        { label: 'Messages', href: '/messages' },
        { label: 'Announcements', href: '/announcementspage' },
        { label: 'User Report', href: '/report-user' },
        { label: 'Bug Report', href: '/report-bug' },
    ];

    if (user?.role === "ADMIN") {
        NAV_ITEMS.push({ label: "Admin", href: "/admin/dashboard" });
    }

    const { user: authUser } = useAuth();

    const displayName = (() => {
        if (!authUser) return 'Account';
        const maybeUsername = (authUser as any).username ?? (authUser as any).displayName;
        if (typeof maybeUsername === 'string' && maybeUsername.trim()) return maybeUsername.trim();
        if (typeof (authUser as any).email === 'string' && (authUser as any).email.includes('@')) {
            return (authUser as any).email.split('@')[0].trim();
        }
        if ((authUser as any).id) return String((authUser as any).id);
        return 'Account';
    })();

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

                    <a href='/profile' className='flex items-center gap-2'>
                        <img src={accountIcon} className='h-6 w-auto' />
                        <p className='font-sans text-[16px]'>{displayName}</p>
                    </a>
                </div>
            </nav>
        </div>
    );
}
