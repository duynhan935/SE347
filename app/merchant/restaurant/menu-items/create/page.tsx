"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { useProductStore } from "@/stores/useProductsStores";

interface SizePrice {
    sizeId: string;
    price: number;
}

export default function MenuCreateForm() {
    const { categories, fetchAllCategories } = useCategoryStore();
    const { sizes, fetchAllSizes } = useSizeStore();
    const { getRestaurantByMerchantId } = useRestaurantStore();
    const restaurantId = useRestaurantStore((state) => state.restaurant?.id ?? "");
    const { createNewProduct } = useProductStore();

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [available, setAvailable] = useState(true);
    const [sizePrices, setSizePrices] = useState<SizePrice[]>([]);
    const [image, setImage] = useState<File | null>(null);

    // Lấy category & size từ store
    useEffect(() => {
        fetchAllCategories();
        fetchAllSizes();

        const merchantId = "testmerchantid";
        getRestaurantByMerchantId(merchantId);
    }, [fetchAllCategories, fetchAllSizes]);

    const handleAddSizePrice = () => {
        setSizePrices([...sizePrices, { sizeId: "", price: 0 }]);
    };

    const handleSizePriceChange = (index: number, field: keyof SizePrice, value: string | number) => {
        const updated = [...sizePrices];
        updated[index] = { ...updated[index], [field]: value };
        setSizePrices(updated);
    };

    const handleRemoveSizePrice = (index: number) => {
        setSizePrices(sizePrices.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(file);
    };

    const handleCreate = async () => {
        if (!productName || !categoryId || !sizePrices.length || !image || !restaurantId) {
            alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
            return;
        }

        const productData = {
            productName,
            description,
            categoryId,
            available,
            restaurantId,
            sizeIds: sizePrices.filter((sp) => sp.sizeId && sp.price > 0),
        };

        console.log(productData);

        try {
            await createNewProduct(productData, image);
            alert("Tạo sản phẩm thành công!");
            // reset form
            setProductName("");
            setDescription("");
            setCategoryId("");
            setSizePrices([]);
            setImage(null);
            setAvailable(true);
        } catch (err) {
            console.error("Lỗi tạo sản phẩm:", err);
            alert("Tạo sản phẩm thất bại!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="px-6 py-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/merchant/restaurant/menu-items" className="hover:text-gray-700">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
                        <span className="text-gray-400">Create</span>
                    </div>

                    {/* Button */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Create
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Nhập tên sản phẩm"
                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.cateName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sizes + Prices */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Kích thước & Giá</label>
                                <button
                                    type="button"
                                    onClick={handleAddSizePrice}
                                    className="flex items-center text-orange-500 hover:text-orange-600 text-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Thêm size
                                </button>
                            </div>

                            {sizePrices.map((sp, index) => (
                                <div key={index} className="flex gap-3 mb-2">
                                    <select
                                        value={sp.sizeId}
                                        onChange={(e) => handleSizePriceChange(index, "sizeId", e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">-- Chọn size --</option>
                                        {sizes.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sp.price}
                                        onChange={(e) => handleSizePriceChange(index, "price", Number(e.target.value))}
                                        placeholder="Giá"
                                        className="w-1/3 px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSizePrice(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Nhập mô tả sản phẩm"
                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setAvailable(!available)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        available ? "bg-orange-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            available ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className="ml-3 text-sm text-gray-700">{available ? "Enabled" : "Disabled"}</span>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Chọn ảnh để tải lên
                                </label>
                                {image && <p className="mt-2 text-sm text-green-600">Đã chọn: {image.name}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
