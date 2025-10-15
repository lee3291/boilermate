type ListingsCardProps = {
    title: string;
    author: string;
    price: string;
    body: string;
};

export default function ListingsCard({title, author, price, body}: ListingsCardProps) {
    return (
        <div>
            <div className="absolute h-100 w-140 z-0 bg-black/20 blur-[5px] rounded-lg" />
            <div className="relative h-100 w-140 z-10 border-black border-[1.5px] bg-white rounded-lg">
                <div className="py-5 px-5">
                    <h1 className="font-roboto-regular text-3xl tracking-[-0.4pt]">{title}</h1>
                    <h1 className="pt-2 text-gray-500 font-roboto-italic text-lg">
                        Created by {author}
                    </h1>
                    <h1 className="text-gray-500 font-roboto-bold text-lg">{price}</h1>
                    <h1 className="pt-2 font-roboto-light text-lg text-wrap">{body}</h1>
                </div>
            </div>
        </div>
    );
}

