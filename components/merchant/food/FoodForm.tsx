"use client";

import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import { categoryApi } from "@/lib/api/categoryApi";
import { sizeApi } from "@/lib/api/sizeApi";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type SelectedSize = { sizeId: string; price: string };

type FoodFormProps = {
    food?: Product | null;
    categories: Category[];
    sizes: Size[];
    restaurant: Restaurant | null;
    onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    onCancel: () => void;
};

export default function FoodForm({ food = null, categories, sizes, restaurant, onSave, onCancel }: FoodFormProps) {
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [localSizes, setLocalSizes] = useState<Size[]>(sizes);

    const [categoryQuery, setCategoryQuery] = useState("");
    const [sizeQuery, setSizeQuery] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [sizeOpen, setSizeOpen] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [creatingSize, setCreatingSize] = useState(false);

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
        setLocalCategories(categories);
    }, [categories]);

    useEffect(() => {
        setLocalSizes(sizes);
    }, [sizes]);

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

            setSelectedSizes(
                food.productSizes?.map((ps) => ({
                    sizeId: ps.sizeId,
                    price: typeof ps.price === "number" && Number.isFinite(ps.price) ? ps.price.toFixed(2) : "",
                })) ?? [],
            );

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

    const selectedCategory = useMemo(() => {
        return localCategories.find((c) => c.id === formData.categoryId) ?? null;
    }, [formData.categoryId, localCategories]);

    const filteredCategories = useMemo(() => {
        const q = categoryQuery.trim().toLowerCase();
        if (!q) return [];
        return localCategories.filter((c) => c.cateName.toLowerCase().includes(q)).slice(0, 12);
    }, [categoryQuery, localCategories]);

    const filteredSizes = useMemo(() => {
        const q = sizeQuery.trim().toLowerCase();
        if (!q) return [];

        const selected = new Set(selectedSizes.map((s) => s.sizeId));
        return localSizes
            .filter((s) => !selected.has(s.id))
            .filter((s) => s.name.toLowerCase().includes(q))
            .slice(0, 12);
    }, [localSizes, selectedSizes, sizeQuery]);

    const addExistingCategory = (categoryId: string) => {
        setFormData((prev) => ({ ...prev, categoryId }));
        setCategoryQuery("");
        setCategoryOpen(false);
    };

    const handleCreateCategory = async (nameRaw: string) => {
        const name = nameRaw.trim();
        if (!name) {
            toast.error("Please enter a category keyword");
            return;
        }

        const existing = localCategories.find((c) => c.cateName.toLowerCase() === name.toLowerCase());
        if (existing) {
            addExistingCategory(existing.id);
            toast.success("Category already exists — selected it.");
            return;
        }

        setCreatingCategory(true);
        try {
            const res = await categoryApi.createCategory({ cateName: name });
            const created = res.data;
            setLocalCategories((prev) => [created, ...prev]);
            addExistingCategory(created.id);
            toast.success("Category created");
        } catch (error) {
            console.error("Failed to create category:", error);
            toast.error("Unable to create category");
        } finally {
            setCreatingCategory(false);
        }
    };

    const addExistingSize = (sizeId: string) => {
        setSelectedSizes((prev) => [...prev, { sizeId, price: "" }]);
        setSizeQuery("");
        setSizeOpen(false);
    };

    const handleCreateSize = async (nameRaw: string) => {
        const name = nameRaw.trim();
        if (!name) {
            toast.error("Please enter a size keyword");
            return;
        }

        const existing = localSizes.find((s) => s.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            const alreadySelected = selectedSizes.some((s) => s.sizeId === existing.id);
            if (!alreadySelected) addExistingSize(existing.id);
            toast.success("Size already exists — added it.");
            return;
        }

        setCreatingSize(true);
        try {
            const res = await sizeApi.createSize({ name });
            const created = res.data;
            setLocalSizes((prev) => [created, ...prev]);
            addExistingSize(created.id);
            toast.success("Size created — set its price");
        } catch (error) {
            console.error("Failed to create size:", error);
            toast.error("Unable to create size");
        } finally {
            setCreatingSize(false);
        }
    };

    const removeSelectedSize = (sizeId: string) => {
        setSelectedSizes((prev) => prev.filter((s) => s.sizeId !== sizeId));
    };

    const handleSizePriceChange = (sizeId: string, price: string) => {
        setSelectedSizes((prev) => prev.map((s) => (s.sizeId === sizeId ? { ...s, price } : s)));
    };

    const normalizePrice = (sizeId: string) => {
        const found = selectedSizes.find((s) => s.sizeId === sizeId);
        if (!found) return;
        const raw = found.price.trim();
        if (!raw) return;
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0) return;
        handleSizePriceChange(sizeId, value.toFixed(2));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!restaurant) {
            toast.error("Please select a restaurant");
            return;
        }

        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }

        if (selectedSizes.length === 0) {
            toast.error("Please select at least one size");
            return;
        }

        const parsedSizes = selectedSizes.map((s) => ({ sizeId: s.sizeId, price: Number(s.price) }));
        if (parsedSizes.some((s) => !Number.isFinite(s.price) || s.price < 0)) {
            toast.error("Please enter a valid price (>= 0.00) for all selected sizes");
            return;
        }

        setSaving(true);
        try {
            await onSave({ ...formData, sizeIds: parsedSizes, restaurantId: restaurant.id }, imageFile);
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
                <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">
                    Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={categoryQuery}
                        onChange={(e) => {
                            setCategoryQuery(e.target.value);
                            setCategoryOpen(true);
                        }}
                        onFocus={() => setCategoryOpen(true)}
                        onBlur={() => setTimeout(() => setCategoryOpen(false), 100)}
                        placeholder="Search categories..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    />

                    {categoryOpen && categoryQuery.trim() ? (
                        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-gray-900">
                            {filteredCategories.length > 0 ? (
                                <div className="max-h-56 overflow-auto">
                                    {filteredCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                        >
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {cat.cateName}
                                            </span>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => addExistingCategory(cat.id)}
                                                className="inline-flex items-center gap-1 rounded-md bg-brand-orange px-2 py-1 text-xs font-semibold text-white hover:bg-brand-orange/90"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleCreateCategory(categoryQuery)}
                                    disabled={creatingCategory}
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                >
                                    {creatingCategory ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    Create new &quot;{categoryQuery.trim()}&quot;
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>

                {selectedCategory ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-sm font-semibold text-brand-orange">
                            {selectedCategory.cateName}
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, categoryId: "" }))}
                                className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-xs font-bold text-brand-orange hover:bg-brand-orange/30"
                                aria-label="Remove category"
                            >
                                ×
                            </button>
                        </span>
                    </div>
                ) : null}
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    Size & Price <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <input
                        type="text"
                        value={sizeQuery}
                        onChange={(e) => {
                            setSizeQuery(e.target.value);
                            setSizeOpen(true);
                        }}
                        onFocus={() => setSizeOpen(true)}
                        onBlur={() => setTimeout(() => setSizeOpen(false), 100)}
                        placeholder="Search sizes..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    />

                    {sizeOpen && sizeQuery.trim() ? (
                        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-gray-900">
                            {filteredSizes.length > 0 ? (
                                <div className="max-h-56 overflow-auto">
                                    {filteredSizes.map((size) => (
                                        <div
                                            key={size.id}
                                            className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                        >
                                            <span className="text-sm text-gray-900 dark:text-white">{size.name}</span>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => addExistingSize(size.id)}
                                                className="inline-flex items-center gap-1 rounded-md bg-brand-orange px-2 py-1 text-xs font-semibold text-white hover:bg-brand-orange/90"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleCreateSize(sizeQuery)}
                                    disabled={creatingSize}
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                >
                                    {creatingSize ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    Create new &quot;{sizeQuery.trim()}&quot;
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="mt-4 space-y-2">
                    {selectedSizes.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No sizes selected.</p>
                    ) : (
                        selectedSizes.map((selected) => {
                            const size = localSizes.find((s) => s.id === selected.sizeId);
                            const name = size?.name ?? "Unknown";

                            return (
                                <div
                                    key={selected.sizeId}
                                    className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-orange/20 bg-brand-orange/5 px-3 py-3 shadow-sm"
                                >
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white">
                                        {name}
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedSize(selected.sizeId)}
                                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                                            aria-label={`Remove size ${name}`}
                                        >
                                            ×
                                        </button>
                                    </span>

                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500">Price</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            inputMode="decimal"
                                            value={selected.price}
                                            onChange={(e) => handleSizePriceChange(selected.sizeId, e.target.value)}
                                            onBlur={() => normalizePrice(selected.sizeId)}
                                            placeholder="0.00"
                                            className="w-36 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
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
