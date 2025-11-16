import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface Poll {
    id: string;
    question: string;
    options: string[];
}

interface PollsSidebarProps {
    polls: Poll[];
    onClose: () => void;
}

export default function PollsSidebar({ polls, onClose }: PollsSidebarProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number[]>>({});
    const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});
    const [newOptionText, setNewOptionText] = useState<Record<string, string>>({});
    const [votes, setVotes] = useState<Record<string, number[]>>({});

    // Initialize votes whenever polls or custom options change
    useEffect(() => {
        polls.forEach(poll => {
            const totalOptions = [...poll.options, ...(customOptions[poll.id] ?? [])];
            setVotes(prev => {
                if (!prev[poll.id] || prev[poll.id].length !== totalOptions.length) {
                    return { ...prev, [poll.id]: totalOptions.map(() => 0) };
                }
                return prev;
            });
        });
    }, [polls, customOptions]);

    const handleToggleOption = (pollId: string, optionIndex: number) => {
        setSelectedOptions(prev => {
            const current = prev[pollId] ?? [];
            if (current.includes(optionIndex)) {
                return { ...prev, [pollId]: current.filter(i => i !== optionIndex) };
            } else {
                return { ...prev, [pollId]: [...current, optionIndex] };
            }
        });
    };

    const handleAddOption = (pollId: string) => {
        const value = newOptionText[pollId]?.trim();
        if (!value) return;

        const existingOptions = [
            ...(polls.find(p => p.id === pollId)?.options ?? []),
            ...(customOptions[pollId] ?? [])
        ];

        if (existingOptions.includes(value)) {
            alert("This option already exists!");
            return;
        }

        setCustomOptions(prev => {
            const current = prev[pollId] ?? [];
            return { ...prev, [pollId]: [...current, value] };
        });

        setNewOptionText(prev => ({ ...prev, [pollId]: "" }));
    };

    const handleVote = (pollId: string) => {
        const selected = selectedOptions[pollId] ?? [];
        setVotes(prev => {
            const updated = [...(prev[pollId] ?? [])];
            selected.forEach(i => {
                updated[i] += 1;
            });
            return { ...prev, [pollId]: updated };
        });
        // Reset selected options after voting
        setSelectedOptions(prev => ({ ...prev, [pollId]: [] }));
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">All Polls</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {polls.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No polls yet</div>
                ) : (
                    polls.map(poll => {
                        const allOptions = [...poll.options, ...(customOptions[poll.id] ?? [])];
                        const pollVotes = votes[poll.id] ?? allOptions.map(() => 0);

                        return (
                            <div key={poll.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-3">
                                <div className="font-medium text-center">{poll.question}</div>

                                <div className="flex flex-col gap-2">
                                    {allOptions.map((opt, i) => (
                                        <button
                                            key={i}
                                            className={`flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 ${
                                                selectedOptions[poll.id]?.includes(i) ? "bg-blue-100" : ""
                                            }`}
                                            onClick={() => handleToggleOption(poll.id, i)}
                                        >
                                            <span className="flex-1 text-left">{opt}</span>
                                            <span className="text-gray-500 mr-3">{pollVotes[i]}</span>
                                            <span
                                                className={`w-4 h-4 border-2 rounded-full ${
                                                    selectedOptions[poll.id]?.includes(i)
                                                        ? "bg-blue-500 border-blue-500"
                                                        : "border-gray-400"
                                                }`}
                                            ></span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Add option"
                                        value={newOptionText[poll.id] ?? ""}
                                        onChange={e => setNewOptionText(prev => ({ ...prev, [poll.id]: e.target.value }))}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleAddOption(poll.id);
                                        }}
                                        className="flex-1 pl-2 pr-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => handleAddOption(poll.id)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleVote(poll.id)}
                                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Vote / Update
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
