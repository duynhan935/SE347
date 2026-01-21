"use client";

import { sizeApi } from "@/lib/api/sizeApi";
import type { Size, SizeData } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SizeFormModal from "./SizeFormModal";

export default function SizesList() {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSize, setCurrentSize] = useState<Size | null>(null);
    const confirmAction = useConfirm();

    useEffect(() => {
        fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
            setLoading(true);
            const response = await sizeApi.getAllSizes();
            setSizes(response.data);
        } catch (error) {
            console.error("Failed to fetch sizes:", error);
            toast.error("Failed to load sizes");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (size: Size | null) => {
        setCurrentSize(size);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentSize(null);
        setIsModalOpen(false);
    };

    const handleSaveSize = async (sizeData: SizeData) => {
        try {
            if (currentSize) {
                await sizeApi.updateSize(currentSize.id, sizeData);
                toast.success("Size updated successfully!");
            } else {
                await sizeApi.createSize(sizeData);
                toast.success("Size created successfully!");
            }
            handleCloseModal();
            fetchSizes();
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to save size";
            toast.error(message);
        }
    };

    const handleDelete = async (sizeId: string) => {
        const ok = await confirmAction({
            title: "Delete size?",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        try {
            await sizeApi.deleteSize(sizeId);
            toast.success("Size deleted successfully!");
            fetchSizes();
        } catch (error: unknown) {
            console.error("Failed to delete size", error);
            const message = error instanceof Error ? error.message : "Failed to delete size";
            toast.error(message);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Sizes</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Size
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center my-10">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                    <span className="ml-3 text-lg">Loading sizes...</span>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sizes.map((size, index) => (
                        <div
                            key={size.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {index + 1}. {size.name}
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(size)}
                                    className="text-blue-600 hover:text-blue-800 p-2"
                                    title="Edit"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(size.id)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                    title="Delete"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && sizes.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No sizes found. Create your first size!</p>
                </div>
            )}

            {isModalOpen && (
                <SizeFormModal
                    isOpen={isModalOpen}
                    size={currentSize}
                    onSave={handleSaveSize}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
