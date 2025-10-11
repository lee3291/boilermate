import accountIcon from "@/assets/images/account.png"

export default function Navbar() {
    type navItem = { label: string; href: string };

    const NAV_ITEMS: navItem[] = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Listings", href: "/listings" },
        { label: "Roomates", href: "/roomates" },
        { label: "Messages", href: "/messages" },
    ];

    return (
        <div className="sticky top-0 z-50 w-full pt-7">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 h-16 w-[92%] rounded-2xl bg-black/20 blur-[5px] " />

            <nav className="relative z-10 h-16 w-[92%] mx-auto rounded-2xl border bg-white px-4 md:px-6">
                <div className="h-full flex items-center justify-between gap-4">
                    <h3 className="text-[22px] font-serif tracking-tight">BoilerMate</h3>

                    <ul className="hidden md:flex items-center gap-6 text-[16px]">
                        {NAV_ITEMS.map((item) => (
                            <li>
                                <a href={item.href} className="text-gray-600 hover:text-black transition-colors">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-2">
                        <img src={accountIcon} className="h-6 w-auto"/>
                        <p className="font-sans text-[16px]">Account</p>
                    </div>
                </div>
            </nav>
        </div>
    );
}

