"use client";

import ConfirmDeleteFoodModal from "@/components/merchant/food/ConfirmDeleteFoodModal";
import FoodCard from "@/components/merchant/food/FoodCard";
import FoodFormModal from "@/components/merchant/food/FoodFormModal";
import FoodSearch from "@/components/merchant/food/FoodSearch";
import FoodStats from "@/components/merchant/food/FoodStats";
import { categoryApi } from "@/lib/api/categoryApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { sizeApi } from "@/lib/api/sizeApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Category, Product, ProductCreateData, RestaurantData, Size } from "@/types";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function FoodPage() {
    const { user } = useAuthStore();
    const { restaurants, getRestaurantByMerchantId } = useRestaurantStore();
    const { products, loading, fetchProductsByRestaurantId, createNewProduct, updateProduct, deleteProduct } =
        useProductStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFood, setCurrentFood] = useState<Product | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
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
                        resName: user.username || "Nhà hàng của tôi",
                        address: "Chưa cập nhật",
                        longitude: 106.809883,
                        latitude: 10.841228,
                        openingTime: "09:00:00",
                        closingTime: "22:00:00",
                        phone: user.phone || "",
                        merchantId: user.id,
                    };

                    await restaurantApi.createRestaurant(defaultRestaurantData);
                    toast.success("Đã tự động tạo nhà hàng cho bạn!");

                    // Reload restaurant after creation
                    await getRestaurantByMerchantId(user.id);
                    setIsCreatingRestaurant(false);
                } else {
                    // Update store with existing restaurant
                    await getRestaurantByMerchantId(user.id);
                }
            } catch (error) {
                console.error("Failed to load/create restaurant:", error);
                toast.error("Không thể tải thông tin nhà hàng");
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
                toast.error("Không thể tải danh sách món ăn");
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRestaurant?.id, isLoadingRestaurant, isCreatingRestaurant]);

    // Load categories and sizes
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
                toast.error("Không thể tải danh mục và size");
            }
        };
        loadData();
    }, []);

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
            toast.success("Xóa món ăn thành công");
            if (currentRestaurant) {
                fetchProductsByRestaurantId(currentRestaurant.id);
            }
            closeDeleteModal();
        } catch (error) {
            console.error("Delete food error:", error);
            toast.error("Xóa món ăn thất bại, vui lòng thử lại");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleOpenModal = (food: Product | null) => {
        setCurrentFood(food);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentFood(null);
        setIsModalOpen(false);
    };

    const handleSaveFood = async (productData: ProductCreateData, imageFile?: File) => {
        try {
            if (currentFood) {
                await updateProduct(currentFood.id, productData, imageFile);
            } else {
                await createNewProduct(productData, imageFile);
            }
            if (currentRestaurant) {
                fetchProductsByRestaurantId(currentRestaurant.id);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Save food error:", error);
            throw error;
        }
    };

    // Show loading while creating restaurant
    if (isLoadingRestaurant || isCreatingRestaurant || !currentRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-brand-purple animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {isCreatingRestaurant ? "Đang tạo nhà hàng..." : "Đang tải thông tin..."}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    {isCreatingRestaurant
                        ? "Hệ thống đang tự động tạo nhà hàng cho bạn. Vui lòng đợi..."
                        : "Đang tải dữ liệu nhà hàng..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Món Ăn</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý menu của nhà hàng: {currentRestaurant.resName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/merchant/food/new"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Thêm Món Ăn
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
                    <Loader2 size={40} className="animate-spin text-brand-purple" />
                </div>
            ) : filteredFoods.length === 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {products.length === 0
                                    ? "Chưa có món ăn nào"
                                    : "Không tìm thấy món ăn phù hợp với từ khóa"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {products.length === 0
                                    ? "Bắt đầu bằng cách thêm món ăn đầu tiên của bạn"
                                    : "Thử đổi từ khóa hoặc thêm món ăn mới"}
                            </p>
                            <button
                                onClick={() => handleOpenModal(null)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Thêm Món Ăn
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map((food) => (
                        <FoodCard
                            key={food.id}
                            food={food}
                            onEdit={handleOpenModal}
                            onDelete={(id) => openDeleteModal(id, food.productName)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {isModalOpen && (
                <FoodFormModal
                    food={currentFood}
                    categories={categories}
                    sizes={sizes}
                    restaurant={currentRestaurant}
                    onSave={handleSaveFood}
                    onClose={handleCloseModal}
                />
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
