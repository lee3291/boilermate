import Navbar from "./components/Navbar.tsx"

export default function Listings() {
    return (
        <div className="bg-white w-full h-[400px]">
            <Navbar />

            <div className="grid grid-cols-2 gap-4">
                <div className="pt-4 pl-15">
                    <h1 className="pb-2 font-extralight font-serif text-[55px] text-maingray">Listings</h1>
                    <button className="h-12 w-60 bg-white border-black border-1 rounded-[100px] font-sans">Create a Listing</button>
                </div>
            </div>
        </div>
    );
}

