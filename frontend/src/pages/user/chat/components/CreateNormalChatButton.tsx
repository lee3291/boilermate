import { Plus } from 'lucide-react';

interface CreateNormalChatButtonProps {
    onClick: () => void;
}

export default function CreateNormalChatButton({ onClick }: CreateNormalChatButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md"
            title="Create 1-1 Chat"
        >
            <Plus size={20} />
        </button>
    );
}
