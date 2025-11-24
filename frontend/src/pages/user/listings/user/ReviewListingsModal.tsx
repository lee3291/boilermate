import React from "react";

interface ReviewListingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResolve: () => void;
    hasMoveInDateIssues: boolean;
    hasDescriptionIssues: boolean;
}

const ReviewListingsModal: React.FC<ReviewListingsModalProps> = ({
    isOpen,
    onClose,
    onResolve,
    hasMoveInDateIssues,
    hasDescriptionIssues,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-50 w-full max-w-xl rounded-[20px] bg-yellow-50 border-2 border-amber-300 shadow-xl px-8 py-6">
                <h2 className="font-sourceserif4-18pt-regular text-[32px] text-yellow-800 mb-3 tracking-tight">
                    Review Required
                </h2>

                <p className="font-roboto-light text-[18px] text-yellow-900 mb-4">
                    Some of your personal listings have been flagged and need your attention.
                </p>

                <div className="bg-white rounded-[12px] border border-yellow-200 px-5 py-4 mb-5">
                    <p className="font-roboto-light text-[16px] text-gray-800 mb-2">
                        We noticed the following potential issues:
                    </p>

                    <ul className="list-disc pl-6 text-[15px] font-roboto-light text-gray-800 space-y-1">
                        {hasMoveInDateIssues && (
                            <li>
                                <span className="font-roboto-medium">
                                    Outdated move-in date
                                </span>{" "}
                                – one or more listings have a move-in date that is in the past
                                or no longer accurate.
                            </li>
                        )}
                        {hasDescriptionIssues && (
                            <li>
                                <span className="font-roboto-medium">
                                    Description reported by users
                                </span>{" "}
                                – users have reported that the description may be inaccurate,
                                misleading, or outdated.
                            </li>
                        )}
                        {!hasMoveInDateIssues && !hasDescriptionIssues && (
                            <li>
                                Listings have been flagged for review, but we couldn’t determine
                                the specific issue type. Please review the details carefully.
                            </li>
                        )}
                    </ul>
                </div>

                <p className="font-roboto-light text-[15px] text-gray-700 mb-6">
                    Choose <span className="font-roboto-medium">Resolve</span> to update
                    the affected listings now, or <span className="font-roboto-medium">Cancel</span> to
                    review them later.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-[10px] border border-gray-300 bg-white text-gray-800 font-roboto-light hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onResolve}
                        className="px-6 py-2 rounded-[10px] bg-yellow-500 text-white font-roboto-medium hover:bg-yellow-600"
                    >
                        Resolve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewListingsModal;

