import { useState } from 'react';
import { approveMessage } from '@/services/chatService';

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
            } catch (err) {
                console.error(err);
            }
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
    onEdit?: (id: string, content: string) => void;
    onDelete?: (id: string, forEveryone: boolean) => void;
}

export default function Message({ m, isMine, currentUserId, onEdit, onDelete }: MessageProps) {
    const [hover, setHover] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(m.content);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const hasImage = m.imageUrl && m.imageUrl.trim().length > 0;
    const hasContent = m.content && m.content.trim().length > 0;

    const isImageApproved = !!m.approvals?.some(
        (a: { userId: string; approved: boolean }) => a.userId === currentUserId && a.approved
    );

    const handleApproved = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} w-full mb-3`}>
            <div className="flex items-center gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs">{m.senderId.split('-')[1]}</span>
                    </div>
                )}

                <div className="flex flex-col">
                    {m.isEdited && (!m.isDeleted || !m.isDeletedForYou) && (
                        <div className={`text-[11px] text-gray-400 mb-0.5 ${isMine ? 'self-end' : 'self-start'}`}>edited</div>
                    )}

                    <div className="flex items-center gap-1">
                        {isMine && hover && !m.isDeleted && !m.isDeletedForYou && (
                            <div className="text-xs text-gray-500 mr-1">
                                <button onClick={() => onDelete?.(m.id, false)} className="hover:underline">
                                    Delete For You
                                </button>
                                <span className="mx-1">|</span>
                                <button onClick={() => onDelete?.(m.id, true)} className="hover:underline">
                                    Delete For Everyone
                                </button>
                            </div>
                        )}

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
                                            approved={isImageApproved}
                                            messageId={m.id}
                                            currentUserId={currentUserId}
                                            onApproved={handleApproved}
                                        />
                                    )}
                                    {hasContent && <div className={hasImage ? 'mt-2' : ''}>{m.content}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isMine && (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span className="text-xs">{m.senderId.split('-')[1]}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
