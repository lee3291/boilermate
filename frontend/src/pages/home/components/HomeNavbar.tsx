export default function Navbar() {
    return (
        <div className="sticky top-0 z-50 w-full pt-3 px-3">
            <nav className="relative z-10 mx-auto h-16 w-full rounded-lg border border-bisonbrown bg-mainbrown px-4 md:px-6">
                <div className="grid grid-cols-3 items-center h-full">
                    <div />

                    <a
                        className="justify-self-center cursor-pointer font-sourceserif4-18pt-light scale-x-90 text-[30px] tracking-tight select-none"
                        href="/"
                    >
                        BoilerMate
                    </a>

                    <div className="justify-self-end flex items-center gap-7 font-roboto-light text-lg">
                        <a href="/signin">Log In</a>
                        <a href="/signup">Sign Up</a>
                    </div>
                </div>
            </nav>
        </div>
    );
}

