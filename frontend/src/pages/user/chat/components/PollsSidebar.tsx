import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface PollOption {
    id: string;
    text: string;
    votes: number;
    votedByUser: boolean;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
}

interface PollsSidebarProps {
    polls: Poll[];
    onClose: () => void;
    onAddOption: (pollId: string, optionText: string) => Promise<any>;
    onSubmitVotes: (pollId: string, opts: { id: string; selected: boolean }[]) => Promise<any>;
}

export default function PollsSidebar({ polls, onClose, onAddOption, onSubmitVotes }: PollsSidebarProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [newOptionText, setNewOptionText] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialSelected: Record<string, string[]> = {};
        polls.forEach(poll => {
            initialSelected[poll.id] = poll.options.filter(opt => opt.votedByUser).map(opt => opt.id);
        });
        setSelectedOptions(initialSelected);
    }, [polls]);

    const handleToggleOption = (pollId: string, optionId: string) => {
        setSelectedOptions(prev => {
            const current = prev[pollId] ?? [];
            if (current.includes(optionId)) {
                return { ...prev, [pollId]: current.filter(id => id !== optionId) };
            }
            return { ...prev, [pollId]: [...current, optionId] };
        });
    };

    const handleAddOption = async (pollId: string) => {
        const text = newOptionText[pollId]?.trim();
        if (!text) return;
        const existingOptions = [...(polls.find(p => p.id === pollId)?.options ?? [])];
        for (const opt of existingOptions) {
            if (opt.text === text) {
                alert("This option already exists!");
                return;
            }
        }
        try {
            await onAddOption(pollId, text);
            setNewOptionText(prev => ({ ...prev, [pollId]: "" }));
            onClose();
        } catch (err: any) {
            if (err?.message?.includes("Option already exists")) {
                alert("This option already exists!");
            } else {
                console.error("Failed to add option", err);
            }
        }
    };

    const handleSubmitVotes = async (pollId: string, pollOptions: PollOption[]) => {
        const selected = selectedOptions[pollId] ?? [];
        const payload = pollOptions.map(opt => ({
            id: opt.id,
            selected: selected.includes(opt.id)
        }));
        await onSubmitVotes(pollId, payload);
        onClose();
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
                    polls.map(poll => (
                        <div key={poll.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-3">
                            <div className="font-medium text-center">{poll.question}</div>

                            <div className="flex flex-col gap-2">
                                {poll.options.map(opt => {
                                    const isSelected = selectedOptions[poll.id]?.includes(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            className={`flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 ${isSelected ? "bg-blue-100" : ""}`}
                                            onClick={() => handleToggleOption(poll.id, opt.id)}
                                        >
                                            <span className="flex-1 text-left">{opt.text}</span>
                                            <span className="text-gray-500 mr-3">{opt.votes}</span>
                                            <span className={`w-4 h-4 border-2 rounded-full ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-400"}`}></span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Add option"
                                    value={newOptionText[poll.id] ?? ""}
                                    onChange={e => setNewOptionText(prev => ({ ...prev, [poll.id]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === "Enter") handleAddOption(poll.id); }}
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
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                onClick={() => handleSubmitVotes(poll.id, poll.options)}
                            >
                                Vote / Update
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
