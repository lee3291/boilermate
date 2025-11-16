import { useRef } from 'react';
import ImageUploadButton from './ImageUploadButton';
import CreatePollButton from './CreatePollButton';
import type { Chat, MessageWithStatus } from '@/types/chats/chat';

export default function InputBar({
  value,
                                     selectedConversation,
  onChange,
  onSend,
  onFileChange, // new prop for handling file selection
  selectedFile, // new prop for displaying selected file
  isUploading, // new prop for showing upload state
                                     onCreatePoll,
                                 }: {
  value?: string;
    selectedConversation?: Chat | null;
  onChange?: (v: string) => void;
  onSend?: (opts?: { recipientId?: string }) => Promise<any> | void;
  onFileChange?: (file: File | null) => void; // handler for file selection
  selectedFile?: File | null; // currently selected file
  isUploading?: boolean; // whether image is being uploaded
    onCreatePoll?: (poll: { question: string; options: string[] }) => void; //Handle for poll in chat
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleSend() {
    // allow sending if there's text OR a file
    const hasContent = (value ?? '').trim().length > 0 || selectedFile !== null;
    if (!hasContent) return; // prevent sending empty message
    onSend?.();
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      // Enter
      if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
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
  const isGroupChat = selectedConversation?.isGroup ?? false;
  return (
    <div className="px-3 py-2 border-t bg-white flex gap-3 items-end max-h-60">
      {/* Image upload button - placed before textarea */}
      <ImageUploadButton
        onFileChange={onFileChange || (() => {})} // use provided handler or noop
        disabled={isUploading} // disable during upload
        selectedFileName={selectedFile?.name} // show selected file name
      />
        {isGroupChat && (
            <>
                <CreatePollButton onCreatePoll={onCreatePoll} />
            </>
        )}

      {/* Message textarea - disabled when file is selected */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={selectedFile ? "Image selected" : "Message"} // change placeholder when file selected
        rows={1}
        disabled={selectedFile !== null || isUploading} // disable text input when file is selected or uploading
        className="flex-1 resize-none px-4 py-2 rounded-full border border-gray-200 min-h-[36px] max-h-[200px] leading-5 overflow-y-auto align-middle disabled:bg-gray-50 disabled:text-gray-500"
      />

      {/* Send button - shows loading state during upload */}
      <button 
        onClick={handleSend} 
        disabled={isUploading} // disable during upload
        className="flex-none bg-blue-600 text-white px-4 h-9 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Send'}
      </button>
    </div>
  );
}
