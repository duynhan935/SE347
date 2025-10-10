import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function AddWidgetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-[#4c4e69]/90 transition-opacity" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <X size={28} />
                        </button>
                    </Dialog.Close>
                    <Dialog.Title asChild>
                        <h2 className="text-2xl font-bold mb-6">Add Widget</h2>
                    </Dialog.Title>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Widget</label>
                        <select className="w-full border rounded px-3 py-2 ">
                            <option>Select a widget</option>
                        </select>
                    </div>
                    <div className="mb-8">
                        <label className="block mb-2 font-medium">Widget Grid Width</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={12} readOnly />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold cursor-pointer">
                                Close
                            </button>
                        </Dialog.Close>
                        <button className="px-4 py-2 rounded bg-orange-600 text-white font-semibold cursor-pointer">
                            Add
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
