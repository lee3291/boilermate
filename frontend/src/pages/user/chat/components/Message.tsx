import { useState, useEffect } from 'react';
import { approveMessage, isBlockedBetween } from '@/services/chatService';
import { X } from 'lucide-react';

interface ImageDisplayProps {
    imageUrl: string;
    isMine: boolean;
    approved: boolean;
    messageId: string;
    currentUserId: string;
    onApproved: () => void;
}

interface Reaction {
    email?: string;
    reaction: string;
}

function ImageDisplay({ imageUrl, isMine, approved, messageId, currentUserId, onApproved }: ImageDisplayProps) {
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [zoomed, setZoomed] = useState(false);
    const [approvedState, setApprovedState] = useState(approved);

    useEffect(() => {
        setApprovedState(approved);
    }, [approved]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setIsLoading(false);
    };

    const handleZoom = async () => {
        setZoomed(true);
        if (!isMine && !approvedState) {
            try {
                await approveMessage(messageId, { userId: currentUserId });
                setApprovedState(true);
                onApproved();
            } catch {}
        }
    };

    const isLandscape = dimensions ? dimensions.width > dimensions.height : true;
    const maxWidth = isLandscape ? 400 : 250;
    const maxHeight = isLandscape ? 250 : 400;

    return (
        <>
            {isLoading && <div className="animate-pulse bg-gray-200 rounded-lg" style={{ width: maxWidth, height: 200 }} />}
            <div className="relative">
                <img
                    src={imageUrl}
                    alt="Chat"
                    onLoad={handleImageLoad}
                    onClick={handleZoom}
                    className={`rounded-lg cursor-pointer transition-all duration-300 ${isLoading ? 'hidden' : 'block'}`}
                    style={{
                        maxWidth: `${maxWidth}px`,
                        maxHeight: `${maxHeight}px`,
                        objectFit: 'contain',
                        filter: approvedState || isMine ? 'none' : 'blur(25px)',
                    }}
                />
            </div>

            {zoomed && (
                <div
                    className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 cursor-zoom-out"
                    onClick={() => setZoomed(false)}
                >
                    <img
                        src={imageUrl}
                        alt="Zoomed"
                        className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg mb-2"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            )}
        </>
    );
}

const emojiToType: Record<string, string> = {
    '👍': 'LIKE',
    '❤️': 'LOVE',
    '😂': 'HAHA',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
};

const typeToEmoji: Record<string, string> = {
    LIKE: '👍',
    LOVE: '❤️',
    HAHA: '😂',
    WOW: '😮',
    SAD: '😢',
    ANGRY: '😡',
};

export default function Message({ m, isMine, currentUserId, senderEmail, onEdit, onDelete,
                                    onAddReaction, onRemoveReaction, onGetReactions, onGetReactionCount}: any) {
    const [hover, setHover] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(m.content);
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const [myReaction, setMyReaction] = useState(m.myReaction || null);
    const [reactionJustClicked, setReactionJustClicked] = useState(false);
    const [reactionCount, setReactionCount] = useState(0);
    const [reactionModalOpen, setReactionModalOpen] = useState(false);
    const [reactionsList, setReactionsList] = useState<any[]>([]);

    const hasImage = m.imageUrl && m.imageUrl.trim().length > 0;
    const hasContent = m.content && m.content.trim().length > 0;

    useEffect(() => {
        const checkBlock = async () => {
            try {
                const blocked = await isBlockedBetween(currentUserId, m.senderId);
                const el = document.getElementById(`msg-${m.id}`);
                if (blocked && el) el.style.display = 'none';
            } catch {}
        };
        checkBlock();
    }, [m.id, m.senderId, currentUserId]);

    useEffect(() => {
        const fetchReactionCount = async () => {
            try {
                const count = await onGetReactionCount(m.id);
                setReactionCount(count);
                const list = await onGetReactions(m.id);
                setReactionsList(
                    list
                        .filter((r: Reaction) => r.email) // only keep reactions with email
                        .map((r: Reaction) => ({
                            userEmail: r.email, // use email only
                            reaction: r.reaction,
                        }))
                );
                const myR = list.find((r: any) => r.userId === currentUserId);
                setMyReaction(myR ? typeToEmoji[myR.reaction] : null);
            } catch {}
        };
        fetchReactionCount();
    }, [m.id, onGetReactionCount]);

    const handleReact = async (emoji: string) => {
        const type = emojiToType[emoji];
        if (!type) return;

        try {
            if (myReaction === emoji) {
                await onRemoveReaction(m.id);
                setMyReaction(null);
            } else {
                await onAddReaction(m.id, currentUserId, type);
                setMyReaction(emoji);
            }
            const count = await onGetReactionCount(m.id);
            setReactionCount(count);
            const list = await onGetReactions(m.id);
            setReactionsList(
                list
                    .filter((r: Reaction) => r.email) // only keep reactions with email
                    .map((r: Reaction) => ({
                        userEmail: r.email, // use email only
                        reaction: r.reaction,
                    }))
            );
            const myR = list.find((r: any) => r.userId === currentUserId);
            setMyReaction(myR ? typeToEmoji[myR.reaction] : null);
        } catch {}

        setReactionPickerOpen(false);
        setReactionJustClicked(true);
        setTimeout(() => setReactionJustClicked(false), 80);
    };

    const handleApproved = () => {};

    return (
        <div id={`msg-${m.id}`} className={`flex flex-col w-full mb-3`}>
            <div
                className={`flex items-start gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                    if (!reactionPickerOpen) setHover(false);
                }}
            >
                {!isMine && (
                    <div className="flex flex-col items-center mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                            {senderEmail[0]?.toUpperCase() ?? '?'}
                        </div>
                    </div>
                )}

                {hover && !reactionJustClicked && !m.isDeleted && !m.isDeletedForYou && (
                    <div className="flex items-center text-xs text-gray-500 gap-2 mt-1">
                        <button onClick={() => setReactionPickerOpen(!reactionPickerOpen)} className="hover:underline">
                            React
                        </button>
                        {isMine && (
                            <>
                                <button onClick={() => onDelete?.(m.id, false)} className="hover:underline">
                                    Delete For You
                                </button>
                                <button onClick={() => onDelete?.(m.id, true)} className="hover:underline">
                                    Delete For Everyone
                                </button>
                                <button onClick={() => onDelete?.(m.id, true)} className="hover:underline">
                                    Pin
                                </button>
                            </>
                        )}
                    </div>
                )}

                <div className="flex flex-col">
                    {m.isEdited && (!m.isDeleted || !m.isDeletedForYou) && (
                        <div className={`text-[11px] text-gray-400 mb-0.5 ${isMine ? 'self-end' : 'self-start'}`}>edited</div>
                    )}

                    <div className="relative flex flex-col">
                        <div
                            className={`${
                                m.isDeleted || m.isDeletedForYou
                                    ? 'bg-gray-100/70 border border-dashed border-gray-300'
                                    : isMine
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-900'
                            } px-3 py-2 rounded-lg shadow-sm max-w-[50vw]`}
                        >
                            {m.isDeleted ? (
                                <div className="text-sm text-gray-400 italic">This message was deleted</div>
                            ) : m.isDeletedForYou ? (
                                <div className="text-sm text-gray-400 italic">You deleted this message</div>
                            ) : editing ? (
                                <div>
                                    <textarea
                                        className="w-full p-2 border rounded text-gray-900"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                onEdit?.(m.id, editText);
                                                setEditing(false);
                                            }}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(false)} className="px-3 py-1 rounded border text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {hasImage && (
                                        <ImageDisplay
                                            imageUrl={m.imageUrl}
                                            isMine={isMine}
                                            approved={m.approved}
                                            messageId={m.id}
                                            currentUserId={currentUserId}
                                            onApproved={handleApproved}
                                        />
                                    )}
                                    {hasContent && <div className={hasImage ? 'mt-2' : ''}>{m.content}</div>}
                                </div>
                            )}
                        </div>

                        {!m.isDeletedForYou && !m.isDeleted && reactionCount > 0 && (
                            <div
                                className={`text-[11px] text-gray-500 mt-1 flex ${
                                    isMine ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <button
                                    onClick={async () => {
                                        try {
                                            setReactionModalOpen(true);
                                        } catch {}
                                    }}
                                    className="px-2 py-0.5 bg-gray-100 rounded-full border text-xs hover:bg-gray-200"
                                >
                                    {reactionCount} reactions
                                </button>
                            </div>
                        )}


                        {reactionPickerOpen && (
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border rounded-full shadow px-2 py-1 flex gap-1 z-20">
                                {['👍', '❤️', '😂', '😮', '😢', '😡'].map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => handleReact(e)}
                                        className={`text-lg hover:scale-110 transition-transform rounded-full p-1
            ${myReaction === e ? 'bg-gray-300' : 'bg-white'}`}
                                    >
                                        {e}
                                    </button>
                                ))}

                            </div>
                        )}
                    </div>
                </div>

                {isMine && (
                    <div className="flex flex-col items-center mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                            {senderEmail[0]?.toUpperCase() ?? '?'}
                        </div>
                    </div>
                )}
            </div>

            {reactionModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/50"
                     onClick={() => setReactionModalOpen(false)}>

                    <div
                        className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-sm mx-4 max-h-[85vh] flex flex-col pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Reactions</h2>
                            <button
                                onClick={() => setReactionModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {reactionsList.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center">No reactions yet.</div>
                            ) : (
                                reactionsList.map((r, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700">
                                                {r.userEmail?.[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <span className="text-sm">{r.userEmail ?? r.userId}</span>
                                        </div>
                                        <div className="text-xl">{typeToEmoji[r.reaction] ?? '❓'}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t flex">
                            <button
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setReactionModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
