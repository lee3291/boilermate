import { Plus } from 'lucide-react';

interface CreateGroupButtonProps {
  onClick: () => void;
}

export default function CreateGroupButton({ onClick }: CreateGroupButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md"
      title="Create Group"
    >
      <Plus size={20} />
    </button>
  );
}
