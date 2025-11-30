import { Pin } from 'lucide-react';

interface PinnedMessageButtonProps {
    onClick: () => void;
}

export default function PinnedMessageButton({ onClick }: PinnedMessageButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black hover:bg-gray-100 transition-colors shadow-md"
            title="View All Pinned Messages"
        >
            <Pin size={20} />
        </button>
    );
}
