"use client";

import { Loader2, Trash2, X } from "lucide-react";

interface ConfirmDeleteRestaurantModalProps {
    open: boolean;
    restaurantName: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ConfirmDeleteRestaurantModal({
    open,
    restaurantName,
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDeleteRestaurantModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete restaurant</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Are you sure you want to delete this restaurant?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {restaurantName ? (
                                    <>
                                        Restaurant: <span className="font-semibold">{restaurantName}</span>
                                    </>
                                ) : (
                                    "This action cannot be undone."
                                )}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        After deleting, all related data for this restaurant cannot be restored.
                    </p>
                </div>

                <div className="px-5 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Delete permanently
                    </button>
                </div>
            </div>
        </div>
    );
}
