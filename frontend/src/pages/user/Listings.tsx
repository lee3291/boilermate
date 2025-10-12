import Navbar from "./components/Navbar.tsx"
import CreateListingForm from "./CreateListingForm.tsx"

export default function Listings() {
    return (
        <div className="bg-white w-full h-[400px]">
            <Navbar />

            <div className="pt-4 flex items-start gap-4">
                <div className="pl-15">
                    <h1 className="pb-2 font-extralight font-sourceserif4-18pt-regular tracking-[-0.02em] text-[55px] text-maingray">Listings</h1>
                    <button className="h-12 w-60 bg-white border-black border-1 rounded-[100px] font-sans">Create a Listing</button>
                </div>
                <div aria-hidden className="mt-10 w-px bg-gray-900 h-200" />

                <div className="flex-1">
                    This is where content must be rendered
                </div>
            </div>

            <CreateListingForm />
        </div>
    );
}

