"use client";

import FoodForm from "@/components/merchant/food/FoodForm";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { categoryApi } from "@/lib/api/categoryApi";
import { productApi } from "@/lib/api/productApi";
import { sizeApi } from "@/lib/api/sizeApi";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductsStores";
import type { Category, Product, ProductCreateData, Size } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditFoodPage() {
    const router = useRouter();
    const params = useParams();
    const foodId = params?.id as string;
    const { user } = useAuthStore();
    const { updateProduct } = useProductStore();
    const { currentRestaurant, isLoadingRestaurant, hasRestaurant } = useMerchantRestaurant();

    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [food, setFood] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [categoriesRes, sizesRes, foodRes] = await Promise.all([
                    categoryApi.getAllCategories(),
                    sizeApi.getAllSizes(),
                    productApi.getProductById(foodId),
                ]);
                setCategories(categoriesRes.data);
                setSizes(sizesRes.data);
                setFood(foodRes.data);
            } catch (error) {
                console.error("Failed to load data:", error);
                toast.error("Could not load food item or categories/sizes");
                router.push("/merchant/food");
            } finally {
                setLoading(false);
            }
        };
        if (foodId) {
            loadData();
        }
    }, [foodId, router]);

    const handleSave = async (productData: ProductCreateData, imageFile?: File) => {
        if (!foodId) return;
        await updateProduct(foodId, productData, imageFile);
    };

    if (!user?.id || user.role !== "MERCHANT") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                You must be a merchant to access this page.
            </div>
        );
    }

    if (isLoadingRestaurant || loading) {
        return (
            <GlobalLoader
                label={loading ? "Loading" : "Loading"}
                sublabel={loading ? "Loading food item information" : "Loading restaurant information"}
                showLogo
            />
        );
    }

    if (!hasRestaurant || !currentRestaurant) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                <h2 className="text-xl font-bold mb-2">Restaurant setup required</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Create your restaurant profile before editing food items.
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

    if (!food) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                Food item not found.
            </div>
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
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Edit food</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Food Item</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update menu item for: <span className="font-semibold">{currentRestaurant.resName}</span>
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <FoodForm
                    food={food}
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
