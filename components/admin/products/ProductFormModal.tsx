"use client";

import { useState, useEffect } from "react";
import type { Product, ProductCreateData, Category, Size, Restaurant } from "@/types";
import { X } from "lucide-react";
import Image from "next/image";

interface ProductFormModalProps {
    product: Product | null;
    categories: Category[];
    sizes: Size[];
    restaurants: Restaurant[];
    onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    onClose: () => void;
}

export default function ProductFormModal({
    product,
    categories,
    sizes,
    restaurants,
    onSave,
    onClose,
}: ProductFormModalProps) {
    const [formData, setFormData] = useState<ProductCreateData>({
        productName: "",
        description: "",
        categoryId: "",
        restaurantId: "",
        available: true,
        sizeIds: [],
    });
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [imagePreview, setImagePreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState<{ sizeId: string; price: number }[]>([]);

    useEffect(() => {
        if (product) {
            setFormData({
                productName: product.productName,
                description: product.description,
                categoryId: product.categoryId,
                restaurantId: product.restaurant?.id || "",
                available: product.available,
                sizeIds: product.productSizes.map((ps: { sizeId: string; price: number }) => ({
                    sizeId: ps.sizeId,
                    price: ps.price,
                })),
            });
            setSelectedSizes(
                product.productSizes.map((ps: { sizeId: string; price: number }) => ({
                    sizeId: ps.sizeId,
                    price: ps.price,
                }))
            );
            if (product.imageURL) {
                setImagePreview(product.imageURL as string);
            }
        }
    }, [product]);

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
        setLoading(true);
        try {
            await onSave({ ...formData, sizeIds: selectedSizes }, imageFile);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{product ? "Edit Product" : "Create Product"}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category *</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
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
                            <label className="block text-sm font-medium mb-1">Restaurant *</label>
                            <select
                                required
                                value={formData.restaurantId}
                                onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            >
                                <option value="">Select restaurant</option>
                                {restaurants.map((rest) => (
                                    <option key={rest.id} value={rest.id}>
                                        {rest.resName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Sizes & Prices *</label>
                        <div className="space-y-2">
                            {sizes.map((size) => {
                                const selectedSize = selectedSizes.find((s) => s.sizeId === size.id);
                                const isSelected = !!selectedSize;

                                return (
                                    <div key={size.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSizeToggle(size.id)}
                                            className="w-4 h-4"
                                        />
                                        <span className="font-medium flex-1">{size.name}</span>
                                        {isSelected && (
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={selectedSize.price}
                                                onChange={(e) => handleSizePrice(size.id, Number(e.target.value))}
                                                placeholder="Price"
                                                className="w-32 border rounded px-2 py-1"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.available}
                                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Available</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Product Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden">
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || selectedSizes.length === 0}
                            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
