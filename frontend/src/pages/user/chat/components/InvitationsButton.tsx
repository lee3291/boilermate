import { Mail } from 'lucide-react';

interface InvitationsButtonProps {
  onClick: () => void;
  count?: number; // number of pending invitations
}

export default function InvitationsButton({ onClick, count }: InvitationsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-md"
      title="View Invitations"
    >
      <Mail size={20} />
      {count && count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
