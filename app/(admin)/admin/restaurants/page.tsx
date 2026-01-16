"use client";

import RestaurantFormModal from "@/components/admin/restaurants/RestaurantFormModal";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { Restaurant, RestaurantData } from "@/types";
import { Ban, CheckCircle, Clock, Edit, Loader2, MapPin, Plus, Search, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RestaurantsPage() {
        const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
        const [searchTerm, setSearchTerm] = useState("");
        const [loading, setLoading] = useState(true);
        const [filterStatus, setFilterStatus] = useState<string>("ALL");
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

        useEffect(() => {
                fetchRestaurants();
        }, []);

        const fetchRestaurants = async () => {
                setLoading(true);
                try {
                        const params = new URLSearchParams();
                        const response = await restaurantApi.getAllRestaurants(params);
                        // Ensure data is an array
                        setRestaurants(Array.isArray(response.data) ? response.data : []);
                } catch (error) {
                        console.error("Failed to fetch restaurants:", error);
                        toast.error("Unable to load restaurants list");
                        setRestaurants([]);
                } finally {
                        setLoading(false);
                }
        };

        const handleSaveRestaurant = async (restaurantData: RestaurantData, imageFile?: File) => {
                try {
                        if (editingRestaurant) {
                                await restaurantApi.updateRestaurant(editingRestaurant.id, restaurantData, imageFile);
                                toast.success("Restaurant updated successfully");
                        } else {
                                await restaurantApi.createRestaurant(restaurantData, imageFile);
                                toast.success("New restaurant added successfully");
                        }
                        setIsModalOpen(false);
                        setEditingRestaurant(null);
                        fetchRestaurants();
                } catch (error) {
                        console.error("Failed to save restaurant:", error);
                        toast.error("Unable to save restaurant");
                }
        };

        const handleToggleStatus = async (restaurant: Restaurant) => {
                try {
                        await restaurantApi.updateRestaurantStatus(restaurant.id);
                        toast.success("Restaurant status updated successfully");
                        fetchRestaurants();
                } catch (error: unknown) {
                        console.error("Failed to toggle status:", error);
                        const errorMessage =
                                error && typeof error === "object" && "response" in error
                                        ? (error as { response?: { data?: { message?: string } } }).response?.data
                                                  ?.message
                                        : undefined;
                        toast.error(errorMessage || "Unable to change restaurant status");
                }
        };

        const handleDeleteRestaurant = async (restaurantId: string) => {
                if (!confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) return;

                try {
                        await restaurantApi.deleteRestaurant(restaurantId);
                        toast.success("Restaurant deleted successfully");
                        fetchRestaurants();
                } catch (error) {
                        console.error("Failed to delete restaurant:", error);
                        toast.error("Unable to delete restaurant");
                }
        };

        const filteredRestaurants = restaurants.filter((restaurant) => {
                const matchesSearch =
                        restaurant.resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus =
                        filterStatus === "ALL" ||
                        (filterStatus === "ACTIVE" ? restaurant.enabled : !restaurant.enabled);
                return matchesSearch && matchesStatus;
        });

        return (
                <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                                <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                Manage Restaurants
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Manage all restaurants in the system
                                        </p>
                                </div>
                                <button
                                        onClick={() => {
                                                setEditingRestaurant(null);
                                                setIsModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors"
                                >
                                        <Plus size={20} />
                                        Add Restaurant
                                </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Restaurants</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                                {restaurants.length}
                                        </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                                {restaurants.filter((r) => r.enabled).length}
                                        </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                                        <p className="text-2xl font-bold text-red-600 mt-1">
                                                {restaurants.filter((r) => !r.enabled).length}
                                        </p>
                                </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Search */}
                                        <div className="relative">
                                                <Search
                                                        size={20}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                        type="text"
                                                        placeholder="Search by name or address..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                />
                                        </div>

                                        {/* Status Filter */}
                                        <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                aria-label="Filter by restaurant status"
                                                title="Filter by restaurant status"
                                        >
                                                <option value="ALL">All Status</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                        </select>
                                </div>
                        </div>

                        {/* Restaurants Grid */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {loading ? (
                                        <div className="flex items-center justify-center p-12">
                                                <Loader2 className="animate-spin text-brand-yellow" size={40} />
                                        </div>
                                ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                                {filteredRestaurants.map((restaurant) => (
                                                        <div
                                                                key={restaurant.id}
                                                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                                        >
                                                                {/* Restaurant Image */}
                                                                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                                                                        {restaurant.imageURL ? (
                                                                                <Image
                                                                                        src={
                                                                                                typeof restaurant.imageURL ===
                                                                                                "string"
                                                                                                        ? restaurant.imageURL
                                                                                                        : restaurant.imageURL
                                                                                        }
                                                                                        alt={restaurant.resName}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                />
                                                                        ) : (
                                                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                                                        No Image
                                                                                </div>
                                                                        )}
                                                                        <div className="absolute top-2 right-2">
                                                                                <span
                                                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                                restaurant.enabled
                                                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                                        }`}
                                                                                >
                                                                                        {restaurant.enabled
                                                                                                ? "Active"
                                                                                                : "Inactive"}
                                                                                </span>
                                                                        </div>
                                                                </div>

                                                                {/* Restaurant Info */}
                                                                <div className="p-4 space-y-3">
                                                                        <div>
                                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                                        {restaurant.resName}
                                                                                </h3>
                                                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                                        <MapPin size={14} />
                                                                                        <span className="line-clamp-1">
                                                                                                {restaurant.address}
                                                                                        </span>
                                                                                </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                                <div className="flex items-center gap-1">
                                                                                        <Clock size={14} />
                                                                                        <span>
                                                                                                {restaurant.openingTime}{" "}
                                                                                                -{" "}
                                                                                                {restaurant.closingTime}
                                                                                        </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                        <span className="text-yellow-500">
                                                                                                ★
                                                                                        </span>
                                                                                        <span>
                                                                                                {restaurant.rating.toFixed(
                                                                                                        1
                                                                                                )}
                                                                                        </span>
                                                                                </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                                <button
                                                                                        onClick={() => {
                                                                                                setEditingRestaurant(
                                                                                                        restaurant
                                                                                                );
                                                                                                setIsModalOpen(true);
                                                                                        }}
                                                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                                                >
                                                                                        <Edit size={16} />
                                                                                        Edit
                                                                                </button>
                                                                                <button
                                                                                        onClick={() =>
                                                                                                handleToggleStatus(
                                                                                                        restaurant
                                                                                                )
                                                                                        }
                                                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                                                                                restaurant.enabled
                                                                                                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                                                        }`}
                                                                                >
                                                                                        {restaurant.enabled ? (
                                                                                                <Ban size={16} />
                                                                                        ) : (
                                                                                                <CheckCircle
                                                                                                        size={16}
                                                                                                />
                                                                                        )}
                                                                                        {restaurant.enabled
                                                                                                ? "Deactivate"
                                                                                                : "Activate"}
                                                                                </button>
                                                                                <button
                                                                                        onClick={() =>
                                                                                                handleDeleteRestaurant(
                                                                                                        restaurant.id
                                                                                                )
                                                                                        }
                                                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                                >
                                                                                        <Trash size={16} />
                                                                                        Delete
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                )}
                                {!loading && filteredRestaurants.length === 0 && (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                No restaurants found
                                        </div>
                                )}
                        </div>

                        {isModalOpen && (
                                <RestaurantFormModal
                                        isOpen={isModalOpen}
                                        onClose={() => {
                                                setIsModalOpen(false);
                                                setEditingRestaurant(null);
                                        }}
                                        restaurantToEdit={editingRestaurant}
                                        onSave={handleSaveRestaurant}
                                />
                        )}
                </div>
        );
}
