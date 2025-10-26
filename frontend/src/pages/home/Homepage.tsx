import HomeNavbar from "./components/HomeNavbar"

import MainImage from "../../assets/images/beg.webp"

export default function Homepage() {
    return (
        <div className="h-400 bg-mainbrown">
            <HomeNavbar />

            <div className="grid grid-cols-2 pt-5 px-4 gap-5">
                <img src={MainImage} className="w-full h-auto rounded-lg"/>
                <div className="pt-10 flex flex-col justify-start origin-right items-end">
                    <h1 className="font-sourceserif4-18pt-regular tracking-tighter scale-x-90 text-maingray origin-left text-[230px] leading-none">
                        Boiler
                    </h1>
                    <h1 className="font-sourceserif4-18pt-regular tracking-tighter scale-x-90 text-maingray origin-left text-[230px] -mt-10 leading-none">
                        Mate
                    </h1>

                    <h3 className="font-sourceserif4-18pt-light tracking-tighter scale-x-90 text-maingray text-[55px] leading-none text-right pt-10">
                        Purdue’s Number 1 Roomate Matching Solution
                    </h3>
                </div>
            </div>
        </div>
    );
}
