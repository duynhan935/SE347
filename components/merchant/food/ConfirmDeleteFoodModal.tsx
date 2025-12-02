"use client";

import { Loader2, X } from "lucide-react";

interface ConfirmDeleteFoodModalProps {
        open: boolean;
        foodName: string | null;
        onConfirm: () => void;
        onCancel: () => void;
        loading: boolean;
}

export default function ConfirmDeleteFoodModal({
        open,
        foodName,
        onConfirm,
        onCancel,
        loading,
}: ConfirmDeleteFoodModalProps) {
        if (!open) return null;

        return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                                <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Xác Nhận Xóa
                                        </h3>
                                        <button
                                                onClick={onCancel}
                                                disabled={loading}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                aria-label="Đóng"
                                                title="Đóng"
                                        >
                                                <X className="w-5 h-5" />
                                        </button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Bạn có chắc chắn muốn xóa món ăn{" "}
                                        <span className="font-semibold text-gray-900 dark:text-white">{foodName}</span>?
                                        Hành động này không thể hoàn tác.
                                </p>
                                <div className="flex items-center gap-3 justify-end">
                                        <button
                                                onClick={onCancel}
                                                disabled={loading}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50"
                                        >
                                                Hủy
                                        </button>
                                        <button
                                                onClick={onConfirm}
                                                disabled={loading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Xóa
                                        </button>
                                </div>
                        </div>
                </div>
        );
}
