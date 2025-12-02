"use client";

import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FoodFormModalProps {
        food: Product | null;
        categories: Category[];
        sizes: Size[];
        restaurant: Restaurant | null;
        onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
        onClose: () => void;
}

export default function FoodFormModal({ food, categories, sizes, restaurant, onSave, onClose }: FoodFormModalProps) {
        const [formData, setFormData] = useState<ProductCreateData>({
                productName: "",
                description: "",
                categoryId: "",
                restaurantId: restaurant?.id || "",
                available: true,
                sizeIds: [],
        });
        const [imageFile, setImageFile] = useState<File | undefined>();
        const [imagePreview, setImagePreview] = useState<string>("");
        const [loading, setLoading] = useState(false);
        const [selectedSizes, setSelectedSizes] = useState<{ sizeId: string; price: number }[]>([]);

        useEffect(() => {
                if (food) {
                        setFormData({
                                productName: food.productName,
                                description: food.description,
                                categoryId: food.categoryId,
                                restaurantId: food.restaurant?.id || restaurant?.id || "",
                                available: food.available,
                                sizeIds: food.productSizes.map((ps) => ({
                                        sizeId: ps.sizeId,
                                        price: ps.price,
                                })),
                        });
                        setSelectedSizes(
                                food.productSizes.map((ps) => ({
                                        sizeId: ps.sizeId,
                                        price: ps.price,
                                }))
                        );
                        if (food.imageURL && typeof food.imageURL === "string" && food.imageURL.trim() !== "") {
                                setImagePreview(food.imageURL);
                        }
                } else if (restaurant) {
                        setFormData((prev) => ({
                                ...prev,
                                restaurantId: restaurant.id,
                        }));
                }
        }, [food, restaurant]);

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                }
        };

        const handleSizeToggle = (sizeId: string) => {
                const exists = selectedSizes.find((s) => s.sizeId === sizeId);
                if (exists) {
                        setSelectedSizes(selectedSizes.filter((s) => s.sizeId !== sizeId));
                } else {
                        setSelectedSizes([...selectedSizes, { sizeId, price: 0 }]);
                }
        };

        const handleSizePrice = (sizeId: string, price: number) => {
                setSelectedSizes(selectedSizes.map((s) => (s.sizeId === sizeId ? { ...s, price } : s)));
        };

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();

                if (!restaurant) {
                        toast.error("Vui lòng chọn nhà hàng");
                        return;
                }

                if (selectedSizes.length === 0) {
                        toast.error("Vui lòng chọn ít nhất một size");
                        return;
                }

                if (selectedSizes.some((s) => s.price <= 0)) {
                        toast.error("Vui lòng nhập giá cho tất cả các size đã chọn");
                        return;
                }

                setLoading(true);
                try {
                        await onSave({ ...formData, sizeIds: selectedSizes }, imageFile);
                        toast.success(food ? "Cập nhật món ăn thành công" : "Tạo món ăn thành công");
                        onClose();
                } catch (error) {
                        console.error("Save food error:", error);
                        toast.error("Có lỗi xảy ra, vui lòng thử lại");
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {food ? "Sửa Món Ăn" : "Thêm Món Ăn Mới"}
                                        </h2>
                                        <button
                                                onClick={onClose}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                aria-label="Đóng"
                                                title="Đóng"
                                        >
                                                <X className="w-6 h-6" />
                                        </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                        {/* Restaurant Info (read-only) */}
                                        {restaurant && (
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Nhà hàng:
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {restaurant.resName}
                                                        </p>
                                                </div>
                                        )}

                                        {/* Food Name */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                        Tên Món Ăn <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="text"
                                                        required
                                                        value={formData.productName}
                                                        onChange={(e) =>
                                                                setFormData({
                                                                        ...formData,
                                                                        productName: e.target.value,
                                                                })
                                                        }
                                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        placeholder="Nhập tên món ăn"
                                                />
                                        </div>

                                        {/* Description */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                        Mô Tả <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                        required
                                                        value={formData.description}
                                                        onChange={(e) =>
                                                                setFormData({
                                                                        ...formData,
                                                                        description: e.target.value,
                                                                })
                                                        }
                                                        rows={3}
                                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        placeholder="Mô tả về món ăn"
                                                />
                                        </div>

                                        {/* Category */}
                                        <div>
                                                <label
                                                        htmlFor="category-select"
                                                        className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
                                                >
                                                        Danh Mục <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                        id="category-select"
                                                        required
                                                        value={formData.categoryId}
                                                        onChange={(e) =>
                                                                setFormData({ ...formData, categoryId: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        aria-label="Chọn danh mục"
                                                >
                                                        <option value="">Chọn danh mục</option>
                                                        {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                        {cat.cateName}
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>

                                        {/* Sizes & Prices */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Size & Giá <span className="text-red-500">*</span>
                                                </label>
                                                <div className="space-y-2">
                                                        {sizes.map((size) => {
                                                                const selectedSize = selectedSizes.find(
                                                                        (s) => s.sizeId === size.id
                                                                );
                                                                const isSelected = !!selectedSize;

                                                                return (
                                                                        <div
                                                                                key={size.id}
                                                                                className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg"
                                                                        >
                                                                                <input
                                                                                        type="checkbox"
                                                                                        id={`size-${size.id}`}
                                                                                        checked={isSelected}
                                                                                        onChange={() =>
                                                                                                handleSizeToggle(
                                                                                                        size.id
                                                                                                )
                                                                                        }
                                                                                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                                                                                        aria-label={`Chọn size ${size.name}`}
                                                                                />
                                                                                <label
                                                                                        htmlFor={`size-${size.id}`}
                                                                                        className="font-medium flex-1 text-gray-900 dark:text-white cursor-pointer"
                                                                                >
                                                                                        {size.name}
                                                                                </label>
                                                                                {isSelected && (
                                                                                        <input
                                                                                                type="number"
                                                                                                required
                                                                                                min="0"
                                                                                                step="1000"
                                                                                                value={
                                                                                                        selectedSize.price
                                                                                                }
                                                                                                onChange={(e) =>
                                                                                                        handleSizePrice(
                                                                                                                size.id,
                                                                                                                Number(
                                                                                                                        e
                                                                                                                                .target
                                                                                                                                .value
                                                                                                                )
                                                                                                        )
                                                                                                }
                                                                                                placeholder="Giá"
                                                                                                aria-label={`Giá cho size ${size.name}`}
                                                                                                className="w-32 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                                                        />
                                                                                )}
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </div>

                                        {/* Available Status */}
                                        <div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                                type="checkbox"
                                                                id="available-checkbox"
                                                                checked={formData.available}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                available: e.target.checked,
                                                                        })
                                                                }
                                                                className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                                                                aria-label="Món ăn có sẵn"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Có sẵn
                                                        </span>
                                                </label>
                                        </div>

                                        {/* Food Image */}
                                        <div>
                                                <label
                                                        htmlFor="food-image-input"
                                                        className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
                                                >
                                                        Hình Ảnh Món Ăn
                                                </label>
                                                <input
                                                        id="food-image-input"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                        aria-label="Chọn hình ảnh món ăn"
                                                />
                                                {imagePreview && imagePreview.trim() !== "" && (
                                                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden">
                                                                <Image
                                                                        src={imagePreview}
                                                                        alt="Preview"
                                                                        fill
                                                                        className="object-cover"
                                                                />
                                                        </div>
                                                )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                                >
                                                        Hủy
                                                </button>
                                                <button
                                                        type="submit"
                                                        disabled={loading || selectedSizes.length === 0}
                                                        className="px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        {food ? "Cập nhật" : "Tạo món ăn"}
                                                </button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}
