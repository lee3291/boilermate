import { useState } from 'react';
import { Pin, X } from 'lucide-react';

export default function PinnedMessageButton({ chatId, onGetPinnedMessages }: any) {
    const [open, setOpen] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const msgs = await onGetPinnedMessages(chatId);
            setPinnedMessages(msgs);
            setOpen(true);
        } catch (e) {
            alert("Failed to fetch pinned messages.");
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black hover:bg-gray-100 transition-colors shadow-md"
                title="View All Pinned Messages"
            >
                <Pin size={20} />
            </button>

            {open && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">
                                Pinned Messages
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="text-center text-sm text-gray-500">Loading...</div>
                            ) : pinnedMessages.length === 0 ? (
                                <div className="text-center text-sm text-gray-500">No pinned messages.</div>
                            ) : (
                                pinnedMessages.map((pm, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-gray-50 rounded-lg border shadow-sm"
                                    >
                                        <div className="text-xs text-gray-500 mb-1">
                                            Pinned at: {new Date(pm.createdAt).toLocaleString()} by {pm.pinnedByEmail}
                                        </div>

                                        <div className="text-sm font-medium mb-1">
                                            {pm.messageContent}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t flex">
                            <button
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
