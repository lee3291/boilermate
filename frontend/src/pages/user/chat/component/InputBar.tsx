import { useEffect, useRef, useState } from 'react';

export default function InputBar({ onSend }: { onSend?: (text: string) => void }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current || !containerRef.current) return;
    const ta = textareaRef.current;
    // measure the content height
    ta.style.height = 'auto';
    const scrollH = ta.scrollHeight;
    const singleLine = 36; // baseline single line height
    const max = 200;
    const newHeight = Math.min(max, Math.max(singleLine, scrollH));
    ta.style.height = `${newHeight}px`;
    // keep container tight when single-line so button aligns
    containerRef.current.style.height = `${newHeight + 16}px`;
  }, [text]);

  function handleSend() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend?.(trimmed);
    setText('');
  }

  return (
    <div ref={containerRef} className="px-3 border-t bg-white flex gap-3 items-center transition-[height] duration-100">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message"
        className="flex-1 resize-none p-2 rounded-full border border-gray-200 min-h-[36px] max-h-[200px] leading-5 overflow-auto"
      />
      <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-md h-9">Send</button>
    </div>
  );
}
