import { useRef } from 'react';

export default function InputBar({
  value,
  onChange,
  onSend,
}: {
  value?: string;
  onChange?: (v: string) => void;
  onSend?: (opts?: { recipientId?: string }) => Promise<any> | void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleSend() {
    const trimmed = (value ?? '').trim();
    if (trimmed.length === 0) return;
    onSend?.();
  }

  // Auto-resize textarea based on content
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    // Reset height to auto to properly calculate new height
    textarea.style.height = 'auto';
    // Set new height based on scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
    onChange?.(textarea.value);
  };

  return (
    <div className="px-3 py-2 border-t bg-white flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        placeholder="Message"
        rows={1}
        className="flex-1 resize-none px-4 py-2 rounded-full border border-gray-200 min-h-[36px] max-h-[200px] leading-5 overflow-hidden align-middle"
      />
      <button onClick={handleSend} className="bg-blue-600 text-white px-4 h-9 rounded-full hover:bg-blue-700 transition-colors">Send</button>
    </div>
  );
}
