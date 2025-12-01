"use client";

import SizeFormModal from "@/components/admin/sizes/SizeFormModal";
import { sizeApi } from "@/lib/api/sizeApi";
import { Size, SizeData } from "@/types";
import { Edit, Loader2, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SizesPage() {
        const [sizes, setSizes] = useState<Size[]>([]);
        const [searchTerm, setSearchTerm] = useState("");
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingSize, setEditingSize] = useState<Size | null>(null);

        useEffect(() => {
                fetchSizes();
        }, []);

        const fetchSizes = async () => {
                setLoading(true);
                try {
                        const response = await sizeApi.getAllSizes();
                        setSizes(response.data);
                } catch (error) {
                        console.error("Failed to fetch sizes:", error);
                        toast.error("Không thể tải danh sách sizes");
                } finally {
                        setLoading(false);
                }
        };

        const handleSaveSize = async (sizeData: SizeData) => {
                try {
                        if (editingSize) {
                                await sizeApi.updateSize(editingSize.id, sizeData);
                                toast.success("Đã cập nhật size");
                        } else {
                                await sizeApi.createSize(sizeData);
                                toast.success("Đã thêm size mới");
                        }
                        setIsModalOpen(false);
                        setEditingSize(null);
                        fetchSizes();
                } catch (error) {
                        console.error("Failed to save size:", error);
                        toast.error("Không thể lưu size");
                }
        };

        const handleDeleteSize = async (sizeId: string) => {
                if (!confirm("Bạn có chắc chắn muốn xóa size này?")) return;

                try {
                        await sizeApi.deleteSize(sizeId);
                        toast.success("Đã xóa size");
                        fetchSizes();
                } catch (error) {
                        console.error("Failed to delete size:", error);
                        toast.error("Không thể xóa size");
                }
        };

        const filteredSizes = sizes.filter((size) => size.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
                <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                                <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                Quản lý Sizes
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Quản lý kích thước mặc định cho món ăn
                                        </p>
                                </div>
                                <button
                                        onClick={() => {
                                                setEditingSize(null);
                                                setIsModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors"
                                >
                                        <Plus size={20} />
                                        Thêm Size
                                </button>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số Sizes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{sizes.length}</p>
                        </div>

                        {/* Search */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="relative">
                                        <Search
                                                size={20}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                                type="text"
                                                placeholder="Tìm kiếm size..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        />
                                </div>
                        </div>

                        {/* Sizes Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {loading ? (
                                        <div className="flex items-center justify-center p-12">
                                                <Loader2 className="animate-spin text-brand-yellow" size={40} />
                                        </div>
                                ) : (
                                        <div className="overflow-x-auto">
                                                <table className="w-full">
                                                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                                                <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                                STT
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                                Tên Size
                                                                        </th>
                                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                                Thao tác
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                {filteredSizes.map((size, index) => (
                                                                        <tr
                                                                                key={size.id}
                                                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                        >
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                                        {index + 1}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                {size.name}
                                                                                        </div>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                                <button
                                                                                                        onClick={() => {
                                                                                                                setEditingSize(
                                                                                                                        size
                                                                                                                );
                                                                                                                setIsModalOpen(
                                                                                                                        true
                                                                                                                );
                                                                                                        }}
                                                                                                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                                                                        title="Chỉnh sửa"
                                                                                                >
                                                                                                        <Edit
                                                                                                                size={
                                                                                                                        18
                                                                                                                }
                                                                                                        />
                                                                                                </button>
                                                                                                <button
                                                                                                        onClick={() =>
                                                                                                                handleDeleteSize(
                                                                                                                        size.id
                                                                                                                )
                                                                                                        }
                                                                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                                                        title="Xóa"
                                                                                                >
                                                                                                        <Trash
                                                                                                                size={
                                                                                                                        18
                                                                                                                }
                                                                                                        />
                                                                                                </button>
                                                                                        </div>
                                                                                </td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                                {filteredSizes.length === 0 && (
                                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                                Không tìm thấy size nào
                                                        </div>
                                                )}
                                        </div>
                                )}
                        </div>

                        {isModalOpen && (
                                <SizeFormModal
                                        isOpen={isModalOpen}
                                        onClose={() => {
                                                setIsModalOpen(false);
                                                setEditingSize(null);
                                        }}
                                        size={editingSize}
                                        onSave={handleSaveSize}
                                />
                        )}
                </div>
        );
}
