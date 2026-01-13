"use client";

import FoodForm from "@/components/merchant/food/FoodForm";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { categoryApi } from "@/lib/api/categoryApi";
import { sizeApi } from "@/lib/api/sizeApi";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductsStores";
import type { Category, ProductCreateData, Size } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function NewFoodPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { createNewProduct } = useProductStore();
    const { currentRestaurant, isLoadingRestaurant, isCreatingRestaurant } = useMerchantRestaurant();

    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [categoriesRes, sizesRes] = await Promise.all([
                    categoryApi.getAllCategories(),
                    sizeApi.getAllSizes(),
                ]);
                setCategories(categoriesRes.data);
                setSizes(sizesRes.data);
            } catch (error) {
                console.error("Failed to load categories/sizes:", error);
                toast.error("Could not load categories and sizes");
            }
        };
        loadData();
    }, []);

    const handleSave = async (productData: ProductCreateData, imageFile?: File) => {
        await createNewProduct(productData, imageFile);
    };

    if (!user?.id || user.role !== "MERCHANT") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                You must be a merchant to access this page.
            </div>
        );
    }

    if (isLoadingRestaurant || isCreatingRestaurant || !currentRestaurant) {
        return (
            <GlobalLoader
                label={isCreatingRestaurant ? "Setting up" : "Loading"}
                sublabel={isCreatingRestaurant ? "Creating your restaurant profile" : "Loading restaurant information"}
                showLogo
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/merchant/food"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">New food</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Food</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add a new menu item for: <span className="font-semibold">{currentRestaurant.resName}</span>
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <FoodForm
                    categories={categories}
                    sizes={sizes}
                    restaurant={currentRestaurant}
                    onSave={handleSave}
                    onCancel={() => router.push("/merchant/food")}
                />
            </div>
        </div>
    );
}
