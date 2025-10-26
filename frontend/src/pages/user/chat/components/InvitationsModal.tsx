import { X, Check, XCircle } from 'lucide-react';

interface Invitation {
  id: string;
  chatId: string;
  userId: string;
  status: string;
  chat: {
    id: string;
    name: string;
    groupIcon?: string;
    creatorId: string;
  };
}

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: Invitation[];
  onAccept: (invitationId: string) => Promise<void>;
  onDecline: (invitationId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function InvitationsModal({
  isOpen,
  onClose,
  invitations,
  onAccept,
  onDecline,
  isLoading = false,
}: InvitationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Invitations</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading invitations...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Group Icon */}
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {invitation.chat.name?.[0]?.toUpperCase() || 'G'}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {invitation.chat.name || 'Unnamed Group'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        You've been invited to join this chat.
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onAccept(invitation.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <Check size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => onDecline(invitation.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <XCircle size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
