import { useState, useEffect } from 'react';
import { approveMessage, isBlockedBetween } from '@/services/chatService';

interface ImageDisplayProps {
    imageUrl: string;
    isMine: boolean;
    approved: boolean;
    messageId: string;
    currentUserId: string;
    onApproved: () => void;
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
            } catch (err) {}
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

interface MessageProps {
    m: any;
    isMine: boolean;
    currentUserId: string;
    senderEmail: string;
    onEdit?: (id: string, content: string) => void;
    onDelete?: (id: string, forEveryone: boolean) => void;
}

export default function Message({ m, isMine, currentUserId, senderEmail, onEdit, onDelete }: MessageProps) {
    const [hover, setHover] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(m.content);
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const [myReaction, setMyReaction] = useState(m.myReaction || null);
    const [reactionJustClicked, setReactionJustClicked] = useState(false);

    const hasImage = m.imageUrl && m.imageUrl.trim().length > 0;
    const hasContent = m.content && m.content.trim().length > 0;

    useEffect(() => {
        const checkBlock = async () => {
            try {
                const blocked = await isBlockedBetween(currentUserId, m.senderId);
                if (blocked) {
                    const el = document.getElementById(`msg-${m.id}`);
                    if (el) el.style.display = 'none';
                }
            } catch (err) {}
        };
        checkBlock();
    }, [m.id, m.senderId, currentUserId]);

    const handleReact = (emoji: string) => {
        if (myReaction === emoji) setMyReaction(null);
        else setMyReaction(emoji);
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

                        {myReaction && (
                            <div className={`text-[11px] text-gray-500 mt-1 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full border text-xs">{myReaction}</span>
                            </div>
                        )}

                        {reactionPickerOpen && (
                            <div className="absolute -top-12 left-1/2 -translate-x-[40%] bg-white border rounded-full shadow px-3 py-2 flex gap-3 z-20">
                                {['👍', '❤️', '😂', '😮', '😢', '😡'].map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => handleReact(e)}
                                        className="text-xl hover:scale-125 transition-transform"
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
        </div>
    );
}
