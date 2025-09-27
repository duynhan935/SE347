import * as Dialog from "@radix-ui/react-dialog";
import { X, GripVertical } from "lucide-react";

interface ColumnSetup {
    label: string;
    checked: boolean;
}

interface ListSetupModalProps {
    open: boolean;
    onClose: () => void;
    columns: ColumnSetup[];
    itemsPerPage?: number[];
    selectedItemsPerPage?: number;
    onApply?: () => void;
    onReset?: () => void;
    onColumnToggle?: (index: number) => void;
    onItemsPerPageChange?: (value: number) => void;
    title?: string;
}

export default function ListSetupModal({
    open,
    onClose,
    columns,
    itemsPerPage = [20, 40, 80, 100, 120],
    selectedItemsPerPage = 20,
    onApply,
    onReset,
    onColumnToggle,
    onItemsPerPageChange,
    title = "List Setup - Orders",
}: ListSetupModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 transition-opacity" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Visible Columns Section */}
                        <div className="mb-8">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Visible Columns</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Set which columns are visible and in what order to display them
                            </p>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {columns.map((col, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center px-4 py-3 border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50"
                                    >
                                        <GripVertical size={16} className="text-gray-400 mr-3 cursor-grab" />
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mr-3"
                                            checked={col.checked}
                                            onChange={() => onColumnToggle?.(idx)}
                                        />
                                        <span
                                            className={`text-sm font-medium ${
                                                col.checked ? "text-gray-900" : "text-gray-500"
                                            }`}
                                        >
                                            {col.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items Per Page Section */}
                        <div className="mb-8">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Items Per Page</h3>
                            <p className="text-sm text-gray-500 mb-4">Limit how many records are shown per page</p>

                            <div className="flex flex-wrap gap-2">
                                {itemsPerPage.map((num) => (
                                    <button
                                        key={num}
                                        className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                                            selectedItemsPerPage === num
                                                ? "bg-gray-100 border-gray-300 text-gray-900"
                                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() => onItemsPerPageChange?.(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
                            onClick={onReset}
                        >
                            Reset
                        </button>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                                onClick={onApply}
                            >
                                Apply changes
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
