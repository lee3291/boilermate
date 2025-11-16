import { UserX } from 'lucide-react';

interface BlockButtonProps {
    onClick: () => void;
}

export default function BlockButton({ onClick }: BlockButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
            title="Block User"
        >
            <UserX size={20} />
        </button>
    );
}
