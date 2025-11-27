import Navbar from "../../components/Navbar.tsx"

export default function Dashboard() {
    return (
        <div>
            <Navbar/>

            <div className="pl-18 pt-5">
                <h1 className="font-sourceserif4-18pt-regular text-maingray pb-2 text-[55px] font-extralight tracking-[-0.02em]">
                    Ongoing Applications
                </h1>
            </div>
        </div>
    );
}
