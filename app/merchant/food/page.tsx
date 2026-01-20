"use client";

import ConfirmDeleteFoodModal from "@/components/merchant/food/ConfirmDeleteFoodModal";
import FoodCard from "@/components/merchant/food/FoodCard";
import FoodSearch from "@/components/merchant/food/FoodSearch";
import FoodStats from "@/components/merchant/food/FoodStats";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductsStores";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function FoodPage() {
    const { user } = useAuthStore();
    const { products, loading, fetchProductsByRestaurantId, deleteProduct } = useProductStore();
    const { currentRestaurant, isLoadingRestaurant, hasRestaurant } = useMerchantRestaurant();

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    // Load products when restaurant is available
    useEffect(() => {
        if (currentRestaurant?.id && !isLoadingRestaurant) {
            fetchProductsByRestaurantId(currentRestaurant.id).catch((error) => {
                console.error("Failed to load products:", error);
                toast.error("Unable to load food items list");
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRestaurant?.id, isLoadingRestaurant]);

    // Filter foods by search term
    const filteredFoods = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return products;
        return products.filter(
            (food) =>
                food.productName.toLowerCase().includes(term) ||
                food.description.toLowerCase().includes(term) ||
                food.categoryName.toLowerCase().includes(term),
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

    if (isLoadingRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-brand-orange animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Loading information...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    Loading restaurant data...
                </p>
            </div>
        );
    }

    if (!hasRestaurant || !currentRestaurant) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                <h2 className="text-xl font-bold mb-2">Restaurant setup required</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    You need to create your restaurant profile before managing food items.
                </p>
                <Link
                    href="/merchant/manage/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                >
                    Go to Settings
                </Link>
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
                                {products.length === 0 ? "No food items yet" : "No food items match your search"}
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
                        <FoodCard key={food.id} food={food} onDelete={(id) => openDeleteModal(id, food.productName)} />
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
