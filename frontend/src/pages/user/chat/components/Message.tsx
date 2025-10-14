import { useState } from 'react';

export default function Message({
  m,
  isMine,
  onEdit,
  onDelete,
}: {
  m: any;
  isMine: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string, forEveryone: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(m.content);

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} w-full mb-3`}>
      {/* Main message container */}
      <div className="flex items-center gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {/* Avatar for received messages */}
        {!isMine && (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs">{m.senderId.split('-')[1]}</span>
          </div>
        )}

        <div className="flex flex-col">
          {/* Edited label - only shows if message is edited and not deleted for you or everyone */}
          {m.isEdited && (!m.isDeleted || !m.isDeletedForYou) && (
            <div className={`text-[11px] text-gray-400 mb-0.5 ${isMine ? 'self-end' : 'self-start'}`}>edited</div>
          )}

          <div className="flex items-center gap-1">
            {/* Actions for my messages => only have this when the message is not deleted*/}
            {isMine && hover && !m.isDeleted && !m.isDeletedForYou && (
              <div className="text-xs text-gray-500 mr-1">
                <button onClick={() => setEditing(true)} className="hover:underline">Edit</button>
                <span className="mx-1">|</span>
                <button onClick={() => onDelete?.(m.id, false)} className="hover:underline">Delete For You</button>
                <span className="mx-1">|</span>
                <button onClick={() => onDelete?.(m.id, true)} className="hover:underline">Delete For Everyone</button>
              </div>
            )}

            {/* Message bubble */} 
            <div className={`${
              m.isDeleted || m.isDeletedForYou
                ? 'bg-gray-100/70 border border-dashed border-gray-300' 
                : isMine 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-900'
            } px-3 py-2 rounded-lg shadow-sm max-w-[50vw]`}>
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
                    <button 
                      onClick={() => setEditing(false)} 
                      className="px-3 py-1 rounded border text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>{m.content}</div>
              )}
            </div>

            {/* Actions for received messages - only Delete For You option */}
            {!isMine && hover && !m.isDeleted && !m.isDeletedForYou && (
              <div className="text-xs text-gray-500 ml-1">
                <button onClick={() => onDelete?.(m.id, false)} className="hover:underline">Delete For You</button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar for my messages */}
        {isMine && (
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-xs">{m.senderId.split('-')[1]}</span>
          </div>
        )}
      </div>
    </div>
  );
}