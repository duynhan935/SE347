"use client";

import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SelectedSize = { sizeId: string; price: number };

type FoodFormProps = {
    food?: Product | null;
    categories: Category[];
    sizes: Size[];
    restaurant: Restaurant | null;
    onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    onCancel: () => void;
};

export default function FoodForm({ food = null, categories, sizes, restaurant, onSave, onCancel }: FoodFormProps) {
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
    const [saving, setSaving] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState<SelectedSize[]>([]);

    useEffect(() => {
        if (food) {
            setFormData({
                productName: food.productName,
                description: food.description,
                categoryId: food.categoryId,
                restaurantId: food.restaurant?.id || restaurant?.id || "",
                available: food.available,
                sizeIds: food.productSizes?.map((ps) => ({ sizeId: ps.sizeId, price: ps.price })) ?? [],
            });

            setSelectedSizes(food.productSizes?.map((ps) => ({ sizeId: ps.sizeId, price: ps.price })) ?? []);

            if (food.imageURL && typeof food.imageURL === "string" && food.imageURL.trim() !== "") {
                setImagePreview(food.imageURL);
            }
            return;
        }

        if (restaurant) {
            setFormData((prev) => ({ ...prev, restaurantId: restaurant.id }));
        }
    }, [food, restaurant]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSizeToggle = (sizeId: string) => {
        const exists = selectedSizes.find((s) => s.sizeId === sizeId);
        setSelectedSizes(
            exists ? selectedSizes.filter((s) => s.sizeId !== sizeId) : [...selectedSizes, { sizeId, price: 0 }]
        );
    };

    const handleSizePrice = (sizeId: string, price: number) => {
        setSelectedSizes(selectedSizes.map((s) => (s.sizeId === sizeId ? { ...s, price } : s)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!restaurant) {
            toast.error("Please select a restaurant");
            return;
        }

        if (selectedSizes.length === 0) {
            toast.error("Please select at least one size");
            return;
        }

        if (selectedSizes.some((s) => s.price <= 0)) {
            toast.error("Please enter a valid price for all selected sizes");
            return;
        }

        setSaving(true);
        try {
            await onSave({ ...formData, sizeIds: selectedSizes, restaurantId: restaurant.id }, imageFile);
            toast.success(food ? "Food updated successfully" : "Food created successfully");
            onCancel();
        } catch (error) {
            console.error("Save food error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {restaurant && (
                <div className="rounded-xl border border-brand-orange/10 bg-brand-orange/5 p-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Restaurant</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{restaurant.resName}</p>
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">
                    Food Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter food name"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    placeholder="Describe the food item"
                />
            </div>

            <div>
                <label
                    htmlFor="category-select"
                    className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white"
                >
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    id="category-select"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.cateName}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    Size & Price <span className="text-red-500">*</span>
                </label>

                <div className="space-y-2">
                    {sizes.map((size) => {
                        const selectedSize = selectedSizes.find((s) => s.sizeId === size.id);
                        const isSelected = Boolean(selectedSize);

                        return (
                            <div
                                key={size.id}
                                className={
                                    "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3 shadow-sm transition " +
                                    (isSelected
                                        ? "border-brand-orange/30 bg-brand-orange/5"
                                        : "border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900")
                                }
                            >
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleSizeToggle(size.id)}
                                        className="h-4 w-4 accent-brand-orange"
                                        aria-label={`Select size ${size.name}`}
                                    />
                                    <span className="font-medium text-gray-900 dark:text-white">{size.name}</span>
                                </label>

                                {isSelected && (
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500">Price</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="1000"
                                            value={selectedSize?.price ?? 0}
                                            onChange={(e) => handleSizePrice(size.id, Number(e.target.value))}
                                            placeholder="Price"
                                            className="w-32 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="h-4 w-4 accent-brand-orange"
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Available</span>
                </label>
            </div>

            <div>
                <label
                    htmlFor="food-image-input"
                    className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white"
                >
                    Food Image
                </label>
                <input
                    id="food-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-white/10 dark:bg-gray-900 dark:text-white"
                />

                {imagePreview && imagePreview.trim() !== "" && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="relative aspect-[16/9] w-full">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200/70 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving || selectedSizes.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-orange/90 disabled:opacity-60"
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {food ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
}
