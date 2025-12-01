"use client";

import ConfirmDeleteRestaurantModal from "@/components/merchant/ConfirmDeleteRestaurantModal";
import { generateManagerCredentials } from "@/lib/utils/managerCredentials";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Loader2, Plus, Search, Store, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function RestaurantsPage() {
        const { user } = useAuthStore();
        const { restaurants, loading, getRestaurantByMerchantId, deleteRestaurant } = useRestaurantStore();
        const [searchTerm, setSearchTerm] = useState("");
        const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
        const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
        const [deleteLoading, setDeleteLoading] = useState(false);

        // Lấy danh sách nhà hàng của merchant hiện tại
        useEffect(() => {
                if (user?.id && user.role === "MERCHANT") {
                        getRestaurantByMerchantId(user.id);
                }
        }, [user?.id, user?.role, getRestaurantByMerchantId]);

        // Lọc theo ô tìm kiếm
        const filteredRestaurants = useMemo(() => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return restaurants;
                return restaurants.filter((res) => res.resName.toLowerCase().includes(term));
        }, [restaurants, searchTerm]);

        const total = restaurants.length;
        const activeCount = restaurants.filter((r) => r.enabled).length;
        const inactiveCount = total - activeCount;

        const openDeleteModal = (id: string, name: string) => {
                setDeleteTargetId(id);
                setDeleteTargetName(name);
        };

        const closeDeleteModal = () => {
                if (deleteLoading) return;
                setDeleteTargetId(null);
                setDeleteTargetName(null);
        };

        const handleConfirmDelete = async () => {
                if (!deleteTargetId) return;
                try {
                        setDeleteLoading(true);
                        await deleteRestaurant(deleteTargetId);
                        toast.success("Xóa nhà hàng thành công");
                        closeDeleteModal();
                } catch (error) {
                        console.error("Delete restaurant error:", error);
                        toast.error("Xóa nhà hàng thất bại, vui lòng thử lại");
                } finally {
                        setDeleteLoading(false);
                }
        };

        return (
                <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                                <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                Nhà Hàng Của Tôi
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Quản lý tất cả nhà hàng của bạn
                                        </p>
                                </div>
                                <Link
                                        href="/merchant/restaurants/create"
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
                                >
                                        <Plus className="h-5 w-5" />
                                        Thêm Nhà Hàng
                                </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Nhà Hàng</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Đang Hoạt Động</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tạm Dừng / Chờ duyệt</p>
                                        <p className="text-2xl font-bold text-red-600 mt-1">{inactiveCount}</p>
                                </div>
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
                                                placeholder="Tìm kiếm nhà hàng..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        />
                                </div>
                        </div>

                        {/* Restaurants Grid */}
                        {loading ? (
                                <div className="flex items-center justify-center py-12">
                                        <Loader2 size={40} className="animate-spin text-brand-yellow" />
                                </div>
                        ) : filteredRestaurants.length === 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                        <div className="col-span-full">
                                                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                                                        <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                {total === 0
                                                                        ? "Chưa có nhà hàng nào"
                                                                        : "Không tìm thấy nhà hàng phù hợp với từ khóa"}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                                {total === 0
                                                                        ? "Bắt đầu bằng cách tạo nhà hàng đầu tiên của bạn"
                                                                        : "Thử đổi từ khóa hoặc tạo nhà hàng mới"}
                                                        </p>
                                                        <Link
                                                                href="/merchant/restaurants/create"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
                                                        >
                                                                <Plus className="h-5 w-5" />
                                                                Tạo Nhà Hàng
                                                        </Link>
                                                </div>
                                        </div>
                                </div>
                        ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredRestaurants.map((res) => (
                                                <div
                                                        key={res.id}
                                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between"
                                                >
                                                        <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                                {res.resName}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                                {res.address}
                                                                        </p>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                                SĐT: {res.phone || "Chưa cập nhật"}
                                                                        </p>
                                                                </div>
                                                                <span
                                                                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                res.enabled
                                                                                        ? "bg-green-100 text-green-700"
                                                                                        : "bg-yellow-100 text-yellow-700"
                                                                        }`}
                                                                >
                                                                        {res.enabled
                                                                                ? "Đang hoạt động"
                                                                                : "Chờ admin duyệt"}
                                                                </span>
                                                        </div>
                                                        <div className="mt-4 space-y-2">
                                                                <div className="flex justify-between items-center gap-3">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                Giờ mở cửa: {res.openingTime} -{" "}
                                                                                {res.closingTime}
                                                                        </p>
                                                                        <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                        openDeleteModal(
                                                                                                res.id,
                                                                                                res.resName
                                                                                        )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                                                                        >
                                                                                <Trash2 className="w-3 h-3" />
                                                                                Xóa
                                                                        </button>
                                                                </div>

                                                                {res.enabled && (
                                                                        <div className="mt-2 rounded-md bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-700 px-3 py-2">
                                                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                                                                        Tài khoản Manager
                                                                                </p>
                                                                                {(() => {
                                                                                        const creds =
                                                                                                generateManagerCredentials(
                                                                                                        res
                                                                                                );
                                                                                        return (
                                                                                                <>
                                                                                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                                                                                                Gmail:{" "}
                                                                                                                <span className="font-mono select-all">
                                                                                                                        {
                                                                                                                                creds.email
                                                                                                                        }
                                                                                                                </span>
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                                                                                                Mật
                                                                                                                khẩu:{" "}
                                                                                                                <span className="font-mono select-all">
                                                                                                                        {
                                                                                                                                creds.password
                                                                                                                        }
                                                                                                                </span>
                                                                                                        </p>
                                                                                                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500">
                                                                                                                Hãy gửi
                                                                                                                thông
                                                                                                                tin này
                                                                                                                cho
                                                                                                                manager
                                                                                                                của nhà
                                                                                                                hàng để
                                                                                                                đăng
                                                                                                                nhập lần
                                                                                                                đầu.
                                                                                                        </p>
                                                                                                </>
                                                                                        );
                                                                                })()}
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                        )}

                        <ConfirmDeleteRestaurantModal
                                open={!!deleteTargetId}
                                restaurantName={deleteTargetName}
                                onConfirm={handleConfirmDelete}
                                onCancel={closeDeleteModal}
                                loading={deleteLoading}
                        />
                </div>
        );
}
