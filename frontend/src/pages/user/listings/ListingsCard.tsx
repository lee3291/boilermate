import { Link } from "react-router-dom";

type ListingsCardProps = {
    id: string;
    title: string;
    author: string;
    price: string;
    body: string;
    location: string;
};

export default function ListingsCard({id, title, author, price, body, location}: ListingsCardProps) {
    // const handleReadMore = () => {
    //     window.open(`/listings/${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer");
    // };

    return (
        <div>
            <div className="absolute h-100 w-140 z-0 bg-black/20 blur-[5px] rounded-lg" />
            <div className="relative h-100 w-140 z-10 border-black border-[1.5px] bg-white rounded-lg">
                <div className="py-5 px-5">
                    <div className="flex justify-between">
                        <h1 className="font-roboto-regular text-3xl tracking-[-0.4pt]">{title}</h1>
                        <h1 className="mt-1 font-sourceserif4-18pt-regular text-[20px] text-gray-400 tracking-[-0.4pt]">{location}</h1>
                    </div>
                    <h1 className="pt-2 text-gray-500 font-roboto-italic text-lg">
                        Created by {author}
                    </h1>
                    <h1 className="text-gray-500 font-roboto-bold text-lg">{price}</h1>
                    <h1 className="pt-2 font-roboto-light text-lg text-wrap">{body}</h1>

                    <div className="flex justify-baseline gap-3">
                        <button className="mt-10 h-12 w-35 bg-black text-white font-roboto-light rounded-4xl cursor-pointer">
                            Apply to join
                        </button>
                        <button className="mt-10 h-12 w-30 bg-white text-black border-black border-1 font-roboto-light rounded-4xl cursor-pointer">
                            Contact
                        </button>
                        {/*<button
                        onClick={handleReadMore}
                        className="ml-2 mt-10 hover:underline-offset-4 hover:underline font-roboto-light text-gray-500 cursor-pointer">
                        Read more
                        </button>*/}

                        <Link
                            to={`/listings/${id}`}
                            state={{ id, title, author, price, body, location }}
                            rel="noopener noreferrer"
                            className="ml-2 mt-13 hover:underline-offset-4 hover:underline font-roboto-light text-gray-500 cursor-pointer">
                            Read more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

