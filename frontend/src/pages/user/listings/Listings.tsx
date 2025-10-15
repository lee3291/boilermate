import Navbar from "../components/Navbar.tsx"
import Card from "./ListingsCard.tsx"
import useSWR from 'swr';
import { fetcher } from '../../../services/listingsFetcher';

export default function Listings() {
    const { data, error, isLoading } = useSWR('/listings/active', fetcher);


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
                    <div className="flex flex-wrap justify-between w-fit gap-10 ml-5 mr-16 mt-10">
                        {isLoading && <div>Loading…</div>}
                        {error && <div className="text-red-600 text-sm whitespace-pre-wrap">{String(error.message || error)}</div>}
                        {data?.length === 0 && <div>No active listings.</div>}
                        {data?.map((l: any) => (
                            <Card
                                key={l.id}
                                title={l.title}
                                author={l.creatorId?.slice(0, 6) ?? 'Unknown'}
                                price={`$${(l.price / 100).toFixed(2)}`}
                                body={l.description}
                                />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

