import { useState } from 'react';

export default function Message({ m, isMine }: { m: any; isMine: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={`py-2 px-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-2">
          <span className="text-sm">{m.senderId.split('-')[1]}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isMine && (
          <div className="w-18 flex justify-start">
            {hover ? (
              <div className="flex gap-2">
                <button className="text-gray-600">Edit</button>
                <button className="text-red-500">Delete</button>
              </div>
            ) : (
              <div className="w-18" />
            )}
          </div>
        )}

        <div className={`${isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} px-3 py-2 rounded-lg shadow-sm max-w-[70%]`}>{m.content}</div>

        {!isMine && (
          <div className="w-18 flex justify-end">
            {hover ? (
              <div className="flex gap-2">
                <button className="text-gray-600">Edit</button>
                <button className="text-red-500">Delete</button>
              </div>
            ) : (
              <div className="w-18" />
            )}
          </div>
        )}
      </div>

      {isMine && (
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center ml-2">
          <span className="text-sm">{m.senderId.split('-')[1]}</span>
        </div>
      )}
    </div>
  );
}

