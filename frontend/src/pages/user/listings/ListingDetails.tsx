import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ListingDetails() {
    const { state } = useLocation() as {
        state?: { id: string; title: string; author: string; price: string; body: string, location: string, moveInStart: string, moveInEnd: string };
    };

    if (!state) return <div>Open this page via the card.</div>;

    const { title, author, price, body, id, location, moveInStart, moveInEnd } = state;

    return (
        <div className="w-full h-400">
            <Navbar />

            <div className="pt-10 pl-18">
                <div className="flex justify-between">
                    <h1 className="font-sourceserif4-18pt-regular text-[55px] tracking-[-0.02em] text-maingray">{title}</h1>

                        <div className="flex justify-baseline gap-3 mr-20 -mt-5">
                            <button className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer">
                                Apply to join
                            </button>
                            <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer">
                                Contact
                            </button>
                        </div>

                </div>
                <div className="flex justify-end mr-22">
                    <a href="/listings" className="font-roboto-light hover:underline hover:underline-offset-2">Return to Listings</a>
                </div>

                <div className="flex gap-10">
                    <p className="text-gray-500 text-[20px] font-roboto-italic tracking-[-0.02em] ">Created by {author}</p>
                    <p className="-mt-[1px] text-gray-400 font-sourceserif4-18pt-italic text-[20px]">{price}</p>
                </div>
                <p className="font-roboto-italic text-[20px] text-gray-600 ">Location: {location}</p>
                <p className="font-roboto-italic text-[20px] text-gray-600 ">Move in Date: {moveInStart} - {moveInEnd}</p>
                <h2 className="mt-10 font-sourceserif4-18pt-regular text-[40px] tracking-[-0.02em] text-maingray">Description</h2>
                <p className="mt-1 font-roboto-light text-[20px] tracking-[-0.02em]">{body}</p>

                <p className="mt-6 text-sm font-roboto-light text-gray-400">Listing ID: {id}</p>
            </div>
        </div>
    );
}
