import { useState } from "react";

export default function CreatePollButton({
                                             onCreatePoll,
                                         }: {
    onCreatePoll?: (poll: { question: string; options: string[] }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>([""]);

    function resetForm() {
        setQuestion("");
        setOptions([""]);
    }

    function handleAddOption() {
        setOptions([...options, ""]);
    }

    function handleRemoveOption(index: number) {
        if (options.length <= 1) return;
        setOptions(options.filter((_, i) => i !== index));
    }

    function handleChangeOption(index: number, value: string) {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    }

    function handleCreate() {
        const cleanedOptions = options.filter((o) => o.trim() !== "");
        if (!question.trim() || cleanedOptions.length < 1) return;

        onCreatePoll?.({
            question: question.trim(),
            options: cleanedOptions,
        });

        resetForm();
        setOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition"
            >
                📊
            </button>

            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold">Create a Poll</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="What's your question?"
                                    className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Options
                                </label>
                                <div className="space-y-2">
                                    {options.map((opt, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleChangeOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1 pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {options.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveOption(index)}
                                                    className="px-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddOption}
                                    className="mt-2 text-blue-600 hover:underline"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-t flex gap-2">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setOpen(false);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={question.trim() === "" || options.filter(o => o.trim() !== "").length < 1}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                    question.trim() === "" || options.filter(o => o.trim() !== "").length < 1
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                Create Poll
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
