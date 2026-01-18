"use client";

import ConfirmDeleteFoodModal from "@/components/merchant/food/ConfirmDeleteFoodModal";
import FoodCard from "@/components/merchant/food/FoodCard";
import FoodSearch from "@/components/merchant/food/FoodSearch";
import FoodStats from "@/components/merchant/food/FoodStats";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { RestaurantData } from "@/types";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function FoodPage() {
    const { user } = useAuthStore();
    const { restaurants, getRestaurantByMerchantId } = useRestaurantStore();
    const { products, loading, fetchProductsByRestaurantId, deleteProduct } = useProductStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);
    const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);

    const currentRestaurant = restaurants[0] || null;

    // Load restaurant - auto-create if not present
    useEffect(() => {
        if (!user?.id || user.role !== "MERCHANT" || isLoadingRestaurant || isCreatingRestaurant) return;

        setIsLoadingRestaurant(true);
        const loadOrCreateRestaurant = async () => {
            try {
                // Load restaurant from API
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                const restaurantList = response.data || [];

                // If no restaurant exists, auto-create a default one
                if (restaurantList.length === 0) {
                    setIsCreatingRestaurant(true);
                    const defaultRestaurantData: RestaurantData = {
                        resName: user.username || "My Restaurant",
                        address: "Not updated",
                        longitude: 106.809883,
                        latitude: 10.841228,
                        openingTime: "09:00:00",
                        closingTime: "22:00:00",
                        phone: user.phone || "",
                        merchantId: user.id,
                    };

                    await restaurantApi.createRestaurant(defaultRestaurantData);
                    toast.success("Restaurant automatically created for you!");

                    // Reload restaurant after creation
                    await getRestaurantByMerchantId(user.id);
                    setIsCreatingRestaurant(false);
                } else {
                    // Update store with existing restaurant
                    await getRestaurantByMerchantId(user.id);
                }
            } catch (error) {
                console.error("Failed to load/create restaurant:", error);
                toast.error("Unable to load restaurant information");
                setIsCreatingRestaurant(false);
            } finally {
                setIsLoadingRestaurant(false);
            }
        };

        loadOrCreateRestaurant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.role]);

    // Load products when restaurant is available
    useEffect(() => {
        if (currentRestaurant?.id && !isLoadingRestaurant && !isCreatingRestaurant) {
            fetchProductsByRestaurantId(currentRestaurant.id).catch((error) => {
                console.error("Failed to load products:", error);
                toast.error("Unable to load food items list");
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRestaurant?.id, isLoadingRestaurant, isCreatingRestaurant]);


    // Filter foods by search term
    const filteredFoods = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return products;
        return products.filter(
            (food) =>
                food.productName.toLowerCase().includes(term) ||
                food.description.toLowerCase().includes(term) ||
                food.categoryName.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

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
            await deleteProduct(deleteTargetId);
            toast.success("Food item deleted successfully");
            if (currentRestaurant) {
                fetchProductsByRestaurantId(currentRestaurant.id);
            }
            closeDeleteModal();
        } catch (error) {
            console.error("Delete food error:", error);
            toast.error("Failed to delete food item, please try again");
        } finally {
            setDeleteLoading(false);
        }
    };


    // Show loading while creating restaurant
    if (isLoadingRestaurant || isCreatingRestaurant || !currentRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-brand-orange animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {isCreatingRestaurant ? "Creating restaurant..." : "Loading information..."}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    {isCreatingRestaurant
                        ? "System is automatically creating a restaurant for you. Please wait..."
                        : "Loading restaurant data..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Food Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage restaurant menu: {currentRestaurant.resName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/merchant/food/new"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Food Item
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <FoodStats foods={products} />

            {/* Search */}
            <FoodSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            {/* Foods Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-brand-orange" />
                </div>
            ) : filteredFoods.length === 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {products.length === 0
                                    ? "No food items yet"
                                    : "No food items match your search"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {products.length === 0
                                    ? "Start by adding your first food item"
                                    : "Try changing your search term or add a new food item"}
                            </p>
                            <Link
                                href="/merchant/food/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Add Food Item
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map((food) => (
                        <FoodCard
                            key={food.id}
                            food={food}
                            onDelete={(id) => openDeleteModal(id, food.productName)}
                        />
                    ))}
                </div>
            )}

            <ConfirmDeleteFoodModal
                open={!!deleteTargetId}
                foodName={deleteTargetName}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
                loading={deleteLoading}
            />
        </div>
    );
}
