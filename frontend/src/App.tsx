import { useState } from "react"
import { Plus } from "lucide-react"
import Listing from "./pages/listing/ListingForm";
export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        //For testing purpose
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <a href="/otp-request" className="text-blue-500 hover:underline font-bold">
                Forgot password?
            </a>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                aria-label="Add roommate listing"
            >
                <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            </button>

            <Listing isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>

    );
}
