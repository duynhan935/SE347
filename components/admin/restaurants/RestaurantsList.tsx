"use client";

import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Restaurant, RestaurantData } from "@/types";
import { CheckCircle, Edit, Loader2, Plus, Search, Trash, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RestaurantFormModal from "./RestaurantFormModal";
// import { toast } from "react-toastify"; // Giả định bạn dùng toast

export default function RestaurantList() {
        const {
                restaurants,
                loading,
                getAllRestaurants,
                createNewRestaurant,
                updateRestaurant,
                updateRestaurantStatus,
                deleteRestaurant,
        } = useRestaurantStore();
        const [searchTerm, setSearchTerm] = useState("");
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);

        useEffect(() => {
                getAllRestaurants();
        }, [getAllRestaurants]);

        const filteredRestaurants = useMemo(() => {
                if (!searchTerm) return restaurants;
                return restaurants.filter(
                        (res) =>
                                res.resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                res.address.toLowerCase().includes(searchTerm.toLowerCase())
                );
        }, [restaurants, searchTerm]);

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
                                // Chế độ UPDATE
                                await updateRestaurant(currentRestaurant.id, restaurantData, imageFile);
                                // toast.success("Restaurant updated!");
                                alert("Restaurant updated!");
                        } else {
                                // Chế độ CREATE
                                await createNewRestaurant(restaurantData, imageFile);
                                // toast.success("Restaurant created!");
                                alert("Restaurant created!");
                        }
                        handleCloseModal();
                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error(error);
                        // toast.error(error.message || "Failed to save restaurant.");
                        alert(error.message || "Failed to save restaurant.");
                }
        };

        // 7. Cập nhật hàm Toggle để gọi store
        const handleToggleEnabled = async (res: Restaurant) => {
                const newStatus = !res.enabled;
                if (!window.confirm(`Set status to ${newStatus ? "ENABLED" : "DISABLED"}?`)) {
                        return;
                }
                try {
                        updateRestaurantStatus(res.id);

                        // toast.success("Status updated!");
                        alert("Status updated!");
                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error("Failed to update status", error);
                        // toast.error("Failed to update status.");
                        alert("Failed to update status.");
                }
        };

        // 8. Cập nhật hàm Delete để gọi store
        const handleDelete = async (resId: string) => {
                if (!window.confirm("Are you sure you want to delete this restaurant? This cannot be undone.")) {
                        return;
                }
                try {
                        await deleteRestaurant(resId);
                        // toast.success("Restaurant deleted!");
                        alert("Restaurant deleted!");

                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        console.error("Failed to delete restaurant", error);
                        // toast.error(error.message || "Failed to delete restaurant.");
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
                                        className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors"
                                >
                                        <Plus className="w-5 h-5" />
                                        Add Restaurant
                                </button>
                        </div>

                        {/* 9. Hiển thị loading từ store */}
                        {loading && (
                                <div className="flex justify-center items-center my-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                                        <span className="ml-3 text-lg">Loading data...</span>
                                </div>
                        )}

                        {/* 10. Ẩn table khi đang loading */}
                        {!loading && (
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
                                                        {filteredRestaurants.map((res) => (
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
                                                                                                        ? "bg-red-100 text-red-800"
                                                                                                        : "bg-green-100 text-green-800"
                                                                                        }`}
                                                                                >
                                                                                        {res.enabled
                                                                                                ? "Disabled"
                                                                                                : "Enabled"}
                                                                                </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                <button
                                                                                        onClick={() =>
                                                                                                handleToggleEnabled(res)
                                                                                        }
                                                                                        className={`mr-4 ${
                                                                                                !res.enabled
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
                                                                                                handleOpenModal(res)
                                                                                        }
                                                                                        className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                                                                                        title="Edit"
                                                                                >
                                                                                        <Edit className="w-5 h-5 inline-block" />
                                                                                </button>

                                                                                <button
                                                                                        onClick={() =>
                                                                                                handleDelete(res.id)
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
