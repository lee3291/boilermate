// conversation list item

export default function ConversationListItem({ otherUsernameId, preview, selected, onClick }: { otherUsernameId: string; preview: string; selected?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`p-3 rounded-lg flex items-center cursor-pointer ${selected ? 'bg-blue-50' : 'bg-transparent'}`}>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
        <span className="text-blue-700 font-bold">{otherUsernameId.split('-')[1]}</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{otherUsernameId}</div>
        <div className="text-gray-500 text-sm">{preview}</div>
      </div>
    </div>
  );
}
