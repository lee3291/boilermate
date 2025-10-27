import accountIcon from '@/assets/images/account.png';

export default function Navbar() {
    return (
        <div className='sticky top-0 z-50 w-full pt-3 px-3'>
            <nav className='relative z-10 mx-auto h-16 w-full rounded-lg border border-bisonbrown bg-mainbrown px-4 md:px-6'>
                <div className='flex h-full items-center justify-between gap-4'>
                    <div />
                    <a
                        className='cursor-pointer font-sourceserif4-18pt-light scale-x-90 text-[30px] tracking-tight select-none'
                        href='/'
                    >
                        BoilerMate
                    </a>

                    <a href='/temp-account' className='flex items-center gap-2'>
                        <img src={accountIcon} className='h-6 w-auto' />
                    </a>
                </div>
            </nav>
        </div>
    );
}

