"use client";

import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Restaurant, RestaurantData } from "@/types";
import { CheckCircle, Edit, Loader2, Plus, Search, Trash, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RestaurantFormModal from "./RestaurantFormModal";
// 1. Import Pagination và các hooks cần thiết
import Pagination from "@/components/client/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RestaurantList() {
        // Hooks từ store (giữ nguyên)
        const {
                restaurants,
                loading,
                getAllRestaurants,
                createNewRestaurant,
                updateRestaurant,
                updateRestaurantStatus,
                deleteRestaurant,
        } = useRestaurantStore();

        // State cho modal và search (giữ nguyên)
        const [searchTerm, setSearchTerm] = useState("");
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);

        // 2. Sử dụng hooks để đọc URL
        const searchParams = useSearchParams();
        const router = useRouter();
        const pathname = usePathname();

        const ITEMS_PER_PAGE = 6; // Số lượng mục mỗi trang

        // 3. Đọc trang hiện tại từ URL, thay vì dùng useState
        const currentPage = Number(searchParams.get("page")) || 1;

        useEffect(() => {
                getAllRestaurants();
        }, [getAllRestaurants]);

        // Logic filter (giữ nguyên)
        const filteredRestaurants = useMemo(() => {
                if (!searchTerm) return restaurants;
                // Reset về trang 1 khi tìm kiếm
                // Bằng cách xóa param 'page' khỏi URL
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                if (currentParams.has("page")) {
                        currentParams.delete("page");
                        // Dùng replace để không thêm vào history của trình duyệt
                        router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
                }

                return restaurants.filter(
                        (res) =>
                                res.resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                res.address.toLowerCase().includes(searchTerm.toLowerCase())
                );
        }, [restaurants, searchTerm, pathname, router, searchParams]);

        // Logic cắt (slice) dữ liệu cho trang hiện tại (giữ nguyên)
        const paginatedRestaurants = useMemo(() => {
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                return filteredRestaurants.slice(startIndex, endIndex);
        }, [filteredRestaurants, currentPage]);

        // --- Các hàm xử lý (handleOpenModal, handleCloseModal, v.v...) giữ nguyên ---
        const handleOpenModal = (restaurant: Restaurant | null) => {
                setCurrentRestaurant(restaurant);
                setIsModalOpen(true);
        };

        const handleCloseModal = () => {
                setCurrentRestaurant(null);
                setIsModalOpen(false);
        };

        const handleSaveRestaurant = async (restaurantData: RestaurantData, imageFile?: File) => {
                try {
                        if (currentRestaurant) {
                                await updateRestaurant(currentRestaurant.id, restaurantData, imageFile);
                                alert("Restaurant updated!");
                        } else {
                                await createNewRestaurant(restaurantData, imageFile);
                                alert("Restaurant created!");
                        }
                        handleCloseModal();

                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error(error);
                        alert(error.message || "Failed to save restaurant.");
                }
        };

        const handleToggleEnabled = async (res: Restaurant) => {
                const newStatus = !res.enabled;
                if (!window.confirm(`Set status to ${newStatus ? "ENABLED" : "DISABLED"}?`)) {
                        return;
                }
                try {
                        await updateRestaurantStatus(res.id);
                        alert("Status updated!");

                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error("Failed to update status", error);
                        alert("Failed to update status.");
                }
        };

        const handleDelete = async (resId: string) => {
                if (!window.confirm("Are you sure you want to delete this restaurant? This cannot be undone.")) {
                        return;
                }
                try {
                        await deleteRestaurant(resId);
                        alert("Restaurant deleted!");

                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error("Failed to delete restaurant", error);
                        alert(error.message || "Failed to delete restaurant.");
                }
        };

        return (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                                <div className="relative w-full max-w-sm">
                                        <input
                                                type="text"
                                                placeholder="Search by name or address..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                                <button
                                        onClick={() => handleOpenModal(null)}
                                        className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors cursor-pointer"
                                >
                                        <Plus className="w-5 h-5" />
                                        Add Restaurant
                                </button>
                        </div>

                        {loading && (
                                <div className="flex justify-center items-center my-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                                        <span className="ml-3 text-lg">Loading data...</span>
                                </div>
                        )}

                        {!loading && (
                                <>
                                        <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                                <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                Name
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                Address
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                Phone
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                Status
                                                                        </th>
                                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                                                Actions
                                                                        </th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                {/* Map qua 'paginatedRestaurants' */}
                                                                {paginatedRestaurants.map((res) => (
                                                                        <tr key={res.id}>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                        {res.resName}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                                                                                        {res.address}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                        {res.phone}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                        <span
                                                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                                        res.enabled
                                                                                                                ? "bg-green-100 text-green-800"
                                                                                                                : "bg-red-100 text-red-800"
                                                                                                }`}
                                                                                        >
                                                                                                {res.enabled
                                                                                                        ? "Enabled"
                                                                                                        : "Disabled"}
                                                                                        </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                        <button
                                                                                                onClick={() =>
                                                                                                        handleToggleEnabled(
                                                                                                                res
                                                                                                        )
                                                                                                }
                                                                                                className={`mr-4 ${
                                                                                                        res.enabled
                                                                                                                ? "text-red-600 hover:text-red-900 cursor-pointer"
                                                                                                                : "text-green-600 hover:text-green-900 cursor-pointer"
                                                                                                }`}
                                                                                                title={
                                                                                                        res.enabled
                                                                                                                ? "Disable"
                                                                                                                : "Enable"
                                                                                                }
                                                                                        >
                                                                                                {res.enabled ? (
                                                                                                        <XCircle className="w-5 h-5 inline-block" />
                                                                                                ) : (
                                                                                                        <CheckCircle className="w-5 h-5 inline-block" />
                                                                                                )}
                                                                                        </button>
                                                                                        <button
                                                                                                onClick={() =>
                                                                                                        handleOpenModal(
                                                                                                                res
                                                                                                        )
                                                                                                }
                                                                                                className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                                                                                                title="Edit"
                                                                                        >
                                                                                                <Edit className="w-5 h-5 inline-block" />
                                                                                        </button>
                                                                                        <button
                                                                                                onClick={() =>
                                                                                                        handleDelete(
                                                                                                                res.id
                                                                                                        )
                                                                                                }
                                                                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                                                title="Delete"
                                                                                        >
                                                                                                <Trash className="w-5 h-5 inline-block" />
                                                                                        </button>
                                                                                </td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                        </div>

                                        {/* 4. Render component Pagination với props mới */}
                                        <Pagination
                                                totalResults={filteredRestaurants.length}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                        />
                                </>
                        )}

                        <RestaurantFormModal
                                isOpen={isModalOpen}
                                onClose={handleCloseModal}
                                restaurantToEdit={currentRestaurant}
                                onSave={handleSaveRestaurant}
                        />
                </div>
        );
}
